'use client';

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createCheckoutPreference } from "@/actions/create-checkout-preference";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";
import { Button } from "@/components/ui/button";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";

interface ButtonMercadoPagoProps {
	uberQuoteId?: string;
	shippingFeeInCents?: number;
	disabled?: boolean;
}

const ButtonMercadoPago = ({
	uberQuoteId,
	shippingFeeInCents,
	disabled,
}: ButtonMercadoPagoProps) => {
	const finishOrderMutation = useFinishOrder();
	const [preferenceId, setPreferenceId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Prefer NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY for client usage
		const publicKey =
			process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
			// tolerate common typo variant if present
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			process.env.NEXT_PUBLIC_MERCARDOPAGO_PUBLIC_KEY ||
			// server-only var won't be available client-side; inform developer
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			process.env.MERCADOPAGO_PUBLIC_KEY ||
			null;

		if (!publicKey) {
			console.error(
				"Mercado Pago public key not found. Set NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY in your .env",
			);
			return;
		}

		try {
			initMercadoPago(publicKey);
		} catch (e) {
			console.error("Failed to initialize MercadoPago SDK:", e);
		}
	}, []);

	const handleClick = async () => {
		setLoading(true);

		const { orderId } = await finishOrderMutation.mutateAsync({
			uberQuoteId,
			shippingFeeInCents,
		});

		const { preferenceId } = await createCheckoutPreference({ orderId });

		if (!preferenceId) {
			setLoading(false);
			throw new Error("Falha ao criar preferência do Mercado Pago");
		}

		setPreferenceId(preferenceId);
		setLoading(false);
	};

	// If we have a preferenceId, render the Mercado Pago Wallet button
	if (preferenceId) {
		return (
			<div className="w-full">
				<Wallet
					initialization={{ preferenceId }}
					// basic error handling hooks
					onError={(err) => {
						console.error("Mercado Pago Wallet error:", err);
					}}
				/>
			</div>
		);
	}

	return (
		<Button
			className="w-full rounded-full"
			size="lg"
			onClick={handleClick}
			disabled={finishOrderMutation.isPending || loading || disabled}
		>
			{(finishOrderMutation.isPending || loading) && (
				<Loader2 className="h-4 w-4 animate-spin" />
			)}
			Ir para pagamento
		</Button>
	);
};

export default ButtonMercadoPago;

