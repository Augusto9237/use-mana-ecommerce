'use server'

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";

type CartProduct = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

export async function Payment(id: string) {
    try {
        const order = await db.query.orderTable.findFirst({
            where: eq(orderTable.id, id),
            with: {
                items: {
                    with: {
                        productVariant: {
                            with: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        const items = order.items.map((oi) => ({
            id: oi.productVariant.id,
            title: `${oi.productVariant.product.name} - ${oi.productVariant.name}`,
            description: oi.productVariant.product.description,
            picture_url: oi.productVariant.imageUrl,
            category_id: oi.productVariant.product.categoryId,
            quantity: Number(oi.quantity),
            unit_price: Number(oi.productVariant.priceInCents) / 100,
        }));

        const response = await fetch(`${process.env.HOST_URL}/api/mercadopago/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Especifica que o corpo da requisição está no formato JSON
                // Adicione outros cabeçalhos se necessário, por exemplo, autenticação
            },
            body: JSON.stringify({ items, id }) // Converte o objeto para uma string JSON
        });

        if (!response.ok) {
            console.log("HTTP error! Status:", response);
            // Se a resposta não for OK, lance um erro com a mensagem da resposta
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Converte a resposta em JSON
        return data; // Imprime a resposta no console
    } catch (error) {
        // Captura e imprime qualquer erro ocorrido
        console.error('There was a problem with the fetch operation:', error);
    }
}