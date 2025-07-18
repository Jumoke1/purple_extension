 function Stats({ stat }) {
  if (!stat) {
    return <p className="text-center text-gray-500">Loading stats...</p>;
  }

  const displayStats = [
    { label: "Total Orders", value: stat.total_orders },
    {label: "Total Revenue",
     value: stat.total_revenue !== null && stat.total_revenue !== undefined
     ? `₦${stat.total_revenue.toLocaleString()}`
     : "₦0"
},
    { label: "Total Customers", value: stat.total_customers },
    { label: "Products in Stock", value: stat.total_product },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      {displayStats.map((stats) => (
        <div key={stats.label} className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500">{stats.label}</p>
          <p className="text-xl font-semibold">{stats.value}</p>
        </div>
      ))}
    </div>
  );
}
export default Stats;
