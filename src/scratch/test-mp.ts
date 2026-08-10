'use server'
export async function testMp() {
    const me = await fetch("https://api.mercadopago.com/users/me", {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    }).then((r) => r.json());

    console.log("Token pertence à conta:", me.id, me.nickname);
    // compare com paymentData.collector_id retornado no search
}