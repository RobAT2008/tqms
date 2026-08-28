export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-primary-50">
      <div className="h-full rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  );
}
