'use server';

import { client } from "@/lib/mercadopago";
import { Payment, Preference } from "mercadopago";

export async function getPayment(preferenceId: string) {
    const paymentClient = new Payment(client);
//    const payment = await paymentClient.get({ requestOptions: { uri: `/v1/payments/${preferenceId}` } });

}
