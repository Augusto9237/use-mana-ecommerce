import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import CartSummary from "../components/cart-summary";
import Addresses from "./components/addresses";
import { calculateUberQuote } from "@/actions/calculate-uber-quote";
import DeliverySummary from "./components/delivery-summary";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const IdentificationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) {
    redirect("/");
  }
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
    with: {
      shippingAddress: true,
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
  if (!cart || cart?.items.length === 0) {
    redirect("/");
  }
  const shippingAddresses = await db.query.shippingAddressTable.findMany({
    where: eq(shippingAddressTable.userId, session.user.id),
  });
  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="space-y-4 px-5 pt-20 pb-8 flex-1 w-full h-full max-w-screen-xl mx-auto">
        <Card>
          <Addresses
            shippingAddresses={shippingAddresses}
            defaultShippingAddressId={cart.shippingAddress?.id || null}
          />
        </Card>
      </div>
      <div className="flex w-full justify-end px-5 py-5 gap-5  max-w-screen-xl mx-auto">
        <Link href="/">
          <Button variant="outline">Continuar Comprando</Button>
        </Link>
        <Link href="/cart/confirmation">
          <Button>Finalizar compra</Button>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default IdentificationPage;
