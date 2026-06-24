export function EntityLogo({
  name,
  logoText,
  logoUrl,
  size = 48,
  className,
}: {
  name: string;
  logoText?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[#e5e9ef] bg-[#f7f8fa] ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
      ) : (
        <span className="text-[13px] font-bold text-[#596373]">{(logoText ?? name).slice(0, 2)}</span>
      )}
    </div>
  );
}
