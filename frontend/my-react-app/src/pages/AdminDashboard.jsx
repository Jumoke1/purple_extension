
import Navbar from "../components/Navbar";
import Stats from "../components/Stats";
import RecentOrders from "../components/RecentOrders";
import { useEffect, useState} from "react";
import Sidebar from "../components/SideBar";



 function AdminDashboard() {
  const [statistics, setStatistics] = useState(null)
  const [recentData, setRecentData] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:5002/admin/statistics`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res)=>{
        if (!res.ok) throw new Error("Failed to fetch statistics");
        return res.json();
    })
    .then((data)=> {
      setStatistics(data)
    })
     .catch((err)=>{
      console.error("Error fetching admin statistics:", err);
     });
  },[])
   
 useEffect(()=> {
      fetch('http://127.0.0.1:5002/recent_orders', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res)=> {
        if(!res.ok) throw new Error('fsiled to fetch recemt orders')
        return res.json()
      })
      .then((data) => {
        setRecentData(data)
      })
       .catch((err)=>{
        console.error("Error fetching admin statistics:", err);
      });
    },[])
 

  
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