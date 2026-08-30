function AdminHeader({
  title,
}) {
  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      ) || "null"
    );

  return (
    <header className="admin-header">

      <div>
        <p>
          THREADED ROOTS
        </p>

        <h1>
          {title}
        </h1>
      </div>

      {user && (
        <div className="admin-user">
          <strong>
            {user.name}
          </strong>

          <span>
            {user.email}
          </span>
        </div>
      )}

    </header>
  );
}

export default AdminHeader;