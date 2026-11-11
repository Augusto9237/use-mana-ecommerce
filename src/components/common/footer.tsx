import Image from "next/image";

const Footer = () => {
  return (
    <div className="w-full gap-1 p-5 bg-card">
      <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center px-5">
        <div>
          <p className="text-xs font-medium">©2026 Copyright Use Mana</p>
          <p className="text-muted-foreground text-xs font-medium">
            Todos os direitos reservados.
          </p>
        </div>

        <Image
          src="/mercadpago.png"
          alt="Mercado Pago"
          width={80}
          height={40}
          className="object-cover h-10"
        />
      </div>
    </div>

  );
};

export default Footer;
