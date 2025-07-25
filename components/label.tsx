import clsx from "clsx";
import Price from "./price"; // Assuming Price component is in the same directory

const Label = ({
  title,
  amount,
  currencyCode,
  availableForSale = true,
  position = "bottom"
}: {
  title: string;
  amount: string;
  currencyCode: string;
  availableForSale?: boolean;
  position?: "bottom" | "center";
}) => {
  return (
    <>
      <div
        className={clsx(
          "absolute w-full px-4 pb-4",
          {
            "bottom-0": position === "bottom",
            "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2":
              position === "center"
          }
        )}
      >
        <div className="flex items-center rounded-full border bg-white/70 p-1 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
          <h3 className="mr-4 line-clamp-2 flex-grow pl-2 leading-none tracking-tight">
            {title}
          </h3>
          <Price
            className="flex-none rounded-full bg-black p-2 text-white"
            amount={amount}
            currencyCode={currencyCode}
            currencyCodeClassName="hidden @[275px]/label:inline"
          />
        </div>
      </div>
      {!availableForSale && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
            SOLD OUT
          </span>
        </div>
      )}
    </>
  );
};

export default Label;