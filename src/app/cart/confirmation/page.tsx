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
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );
  if (!cart.shippingAddress) {
    redirect("/cart/identification");
  }

  // Calcular cotação de frete da Uber Direct
  const uberQuote = await calculateUberQuote();
  const shippingFeeInCents = uberQuote && !("error" in uberQuote) ? uberQuote.feeInCents : 0;
  const uberQuoteId = uberQuote && !("error" in uberQuote) ? uberQuote.quoteId : undefined;
  const uberUnavailable = uberQuote !== null && "error" in uberQuote;
  const totalInCents = cartTotalInCents + shippingFeeInCents;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="space-y-5 px-5 pt-20 pb-8 w-full max-w-7xl mx-auto flex-1 h-full">
        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card>
              <CardContent>
                <p className="text-sm">{formatAddress(cart.shippingAddress)}</p>
              </CardContent>
            </Card>

            {uberUnavailable && (
              <p className="text-sm text-destructive">
                ⚠️ Não foi possível calcular o frete para este endereço. Verifique o endereço ou tente novamente.
              </p>
            )}


          </CardContent>
        </Card>
        <CartSummary
          subtotalInCents={cartTotalInCents}
          shippingFeeInCents={shippingFeeInCents}
          totalInCents={totalInCents}
          products={cart.items.map((item) => ({
            id: item.productVariant.id,
            name: item.productVariant.product.name,
            variantName: item.productVariant.name,
            quantity: item.quantity,
            priceInCents: item.productVariant.priceInCents,
            imageUrl: Array.isArray(item.productVariant.imageUrl)
              ? item.productVariant.imageUrl[0] ?? ""
              : item.productVariant.imageUrl,
          }))}
        />
        <FinishOrderButton
          uberQuoteId={uberQuoteId}
          shippingFeeInCents={shippingFeeInCents}
          disabled={uberUnavailable}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ConfirmationPage;
