
import Navbar from "../components/Navbar";
import Stats from "../components/Stats";
import RecentOrders from "../components/RecentOrders";
import { useEffect, useState} from "react";
import Sidebar from "../components/SideBar";



 function AdminDashboard() {
  const [statistics, setStatistics] = useState(null)
  const [recentData, setRecentData] = useState(null)
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(`http://127.0.0.1:5002/admin/statistics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch statistics");

        const data = await res.json();
        setStatistics(data);
      } catch (err) {
        console.error("Error fetching admin statistics:", err);
        setError(err.message);
      }
    };

    fetchStatistics();
  }, []);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ Get token from localStorage

        const res = await fetch(`http://127.0.0.1:5002/orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // ✅ Attach token here too
          },
        });

        if (!res.ok) throw new Error("Failed to fetch recent orders");

        const data = await res.json();
        setRecentData(data);
      } catch (err) {
        console.error("Error fetching recent orders:", err);
        setError(err.message);
      }
    };

    fetchRecentOrders();
  }, []);


  return (
    <div className="flex bg-purple-100 min-h-screen p-4">
         <Sidebar/>
      <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
         <Navbar />
        <Stats  stat={statistics}/>
        <RecentOrders orders={recentData?.orders || []} />

       </div>
      </div>
    </div>
  );
}
export default AdminDashboard;