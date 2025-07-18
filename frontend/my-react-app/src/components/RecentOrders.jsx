

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800",
  Shipped: "bg-green-100 text-green-800",
  Delivered: "bg-blue-100 text-blue-800",
  Canceled: "bg-gray-100 text-gray-800",
};

 function RecentOrders({orders = []}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow my-4">
      <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>

        </thead>
        <tbody>
           {orders.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                No recent orders
              </td>
            </tr>
           ):(
           orders.map(order => (
            <tr key={order.id} className="border-b last:border-none">
              <td>{order.id}</td>
              <td>{order.fullname}</td>
              <td>{order.amount}</td>
              <td>{order.status}</td>
              <td>{order.reference}</td>
              <td>{order.created_at}</td>
              <td>{order.phone}</td>
              <td>{order.date}</td>
              <td>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td>{order.amount}</td>
            </tr>
          ))
        )}
        </tbody>
      </table>
    </div>
  );
}
export default RecentOrders;