import { preference } from "@/lib/mercadopago";
import { Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const items = data.items.map((product: any) => {
            // Convertendo o basePrice para número
            const basePrice = parseFloat(product.basePrice);
            // Calculando o valor do desconto
            const discountValue = (product.discountPercentage / 100) * basePrice;
            // Calculando o preço unitário com desconto
            const unitPrice = basePrice - discountValue;

            return {
                id: product.id,
                title: product.name,
                quantity: product.quantity,
                unit_price: Number(unitPrice.toFixed(2)),  // Garantindo que o preço tenha 2 casas decimais
                currency_id: "BRL"
            }
        });

        const body = {
            items: items,
            external_reference: data.id,
            back_urls: {
                success: `${process.env.HOST_URL}/api/mercadopago/payment/?success=true`,
                failure: `${process.env.HOST_URL}/api/mercadopago/payment/?canceled=true`,
                pending: `${process.env.HOST_URL}/api/mercadopago/payment/?pending=true`
            },
            auto_return: "approved"
        }


        const result = await preference.create({ body });
        console.log("Preference created:", result);
      
        return NextResponse.json(result)
    } catch (error) {
        console.log(error)
    }
}