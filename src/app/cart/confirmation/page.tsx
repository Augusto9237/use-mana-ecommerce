import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { calculateUberQuote } from "@/actions/calculate-uber-quote";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { auth } from "@/lib/auth";

import CartSummary from "../components/cart-summary";
import { formatAddress } from "../helpers/address";
import FinishOrderButton from "./components/finish-order-button";
import { lookupZipcode } from "@/lib/lookup-zipcode";
import { MapPin } from "lucide-react";

const ConfirmationPage = async () => {
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
  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + (item.productVariant.discountPriceInCents ?? item.productVariant.priceInCents) * item.quantity,
    0,
  );
  if (!cart.shippingAddress) {
    redirect("/cart/identification");
  }

  const delivery = (await lookupZipcode(cart.shippingAddress.zipCode)).valorFrete
  const totalInCents = delivery + cartTotalInCents

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="space-y-5 px-5 pt-24 pb-8 w-full max-w-7xl mx-auto flex-1 h-full">
        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="p-0">
              <CardContent className="p-4 flex flex-row items-center gap-2">
                <MapPin className="size-8 md:size-5" />
                <p className="text-sm">
                  {formatAddress(cart.shippingAddress)}
                </p>
              </CardContent>
            </Card>

          </CardContent>
        </Card>
        <CartSummary
          subtotalInCents={cartTotalInCents}
          shippingFeeInCents={delivery}
          totalInCents={totalInCents}
          products={cart.items.map((item) => ({
            id: item.productVariant.id,
            name: item.productVariant.product.name,
            variantName: item.productVariant.name,
            quantity: item.quantity,
            priceInCents: item.productVariant.discountPriceInCents ?? item.productVariant.priceInCents,
            imageUrl: Array.isArray(item.productVariant.imageUrl)
              ? item.productVariant.imageUrl[0] ?? ""
              : item.productVariant.imageUrl,
          }))}
        />
        <FinishOrderButton
          shippingFeeInCents={delivery}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ConfirmationPage;
