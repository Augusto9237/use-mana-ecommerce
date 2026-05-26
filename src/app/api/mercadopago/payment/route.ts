import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const reqUrl = new URL(req.url);
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('collection_status');
    const id = searchParams.get('external_reference');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true' && (status !== 'approved')) {
        if (id) {
            await db.delete(orderTable).where(eq(orderTable.id, id));
        }
        return NextResponse.redirect(new URL(`${process.env.HOST_URL}/success/false`));
    }

    if (id && status === 'approved') {
        await db.update(orderTable).set({ status: "paid" }).where(eq(orderTable.id, id));
    }
  
    return NextResponse.redirect(new URL(`${process.env.HOST_URL}/success/true`));
};