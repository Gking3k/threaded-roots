function StatCard({
  label,
  value,
  prefix = "",
}) {
  return (
    <article className="stat-card">
      <span>
        {label}
      </span>

      <strong>
        {prefix}
        {value}
      </strong>
    </article>
  );
}

export default StatCard;