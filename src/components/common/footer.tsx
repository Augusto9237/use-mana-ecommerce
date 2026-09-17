import Image from "next/image";

const Footer = () => {
  return (
    <div className="w-full gap-1 p-6 bg-card">
      <div className="w-full max-w-screen-xl mx-auto flex justify-between">
        <div>
          <p className="text-xs font-medium">© 2026 Copyright RD FITNESS</p>
          <p className="text-muted-foreground text-xs font-medium">
            Todos os direitos reservados.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium">Ambiente 100% seguro</p>
          <div className="flex gap-2">
            <Image
              src="/mercadopago.png"
              alt="Mercado Pago"
              width={40}
              height={22}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default Footer;
