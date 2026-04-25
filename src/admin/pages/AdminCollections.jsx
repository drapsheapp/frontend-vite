import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/api";
import { ArrowLeft, Plus, Pencil, Trash, Search } from "lucide-react";

export default function AdminCollections(){

const navigate = useNavigate();

const [collections,setCollections] = useState([]);
const [filtered,setFiltered] = useState([]);

const [search,setSearch] = useState("");

const [page,setPage] = useState(1);

const perPage = 25;


/* ================= FETCH ================= */

const fetchCollections = async()=>{

try{

const res = await API.get("/admin/collections");

setCollections(res.data);
setFiltered(res.data);

}catch(err){

console.error(err);

}

};

useEffect(()=>{

fetchCollections();

},[]);


/* ================= SEARCH ================= */

useEffect(()=>{

const result = collections.filter(c =>

c.name.toLowerCase().includes(search.toLowerCase()) ||
c.slug.toLowerCase().includes(search.toLowerCase())

);

setFiltered(result);
setPage(1);

},[search,collections]);


/* ================= DELETE ================= */

const deleteCollection = async(id)=>{

const confirmDelete = window.confirm("Delete this collection?");

if(!confirmDelete) return;

try{

await API.delete(`/admin/collections/${id}`);

setCollections(prev => prev.filter(c => c._id !== id));
setFiltered(prev => prev.filter(c => c._id !== id));

}catch(err){

console.error("Delete failed",err);

}

};


/* ================= PAGINATION ================= */

const totalPages = Math.ceil(filtered.length / perPage);

const start = (page - 1) * perPage;

const visible = filtered.slice(start,start + perPage);


/* ================= UI ================= */

return(

<div className="px-10 py-8 bg-gray-50 min-h-screen">


{/* HEADER */}

<div className="flex justify-between items-center mb-6 max-w-7xl">

<div className="flex items-center gap-3">

<button
onClick={()=>navigate("/admin")}
className="p-2 rounded hover:bg-gray-200"
>
<ArrowLeft size={18}/>
</button>

<h1 className="text-2xl font-semibold text-gray-800">
Collections
</h1>

</div>


<button
onClick={()=>navigate("/admin/collections/new")}
className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-purple-700"
>

<Plus size={16}/>
Add Collection

</button>

</div>



{/* SEARCH */}

<div className="max-w-7xl mb-5">

<div className="relative">

<Search
size={18}
className="absolute left-3 top-3 text-gray-400"
/>

<input
type="text"
placeholder="Search collections..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
/>

</div>

</div>



{/* TABLE */}

<div className="max-w-7xl bg-white border rounded-xl shadow-sm">

<div className="max-h-[420px] overflow-y-auto">

<table className="w-full text-sm">

<thead className="bg-gray-100 sticky top-0">

<tr>

<th className="p-3 border text-left">Name</th>

<th className="p-3 border text-left">Slug</th>

<th className="p-3 border text-left">Category</th>

<th className="p-3 border text-left w-24">Action</th>

</tr>

</thead>

<tbody>

{visible.map(c => (

<tr key={c._id} className="hover:bg-gray-50">

<td className="p-3 border">
{c.name}
</td>

<td className="p-3 border text-gray-600">
{c.slug}
</td>

<td className="p-3 border">
{c.category}
</td>

<td className="p-3 border">

<div className="flex items-center gap-3">

<button
onClick={()=>navigate(`/admin/collections/edit/${c._id}`)}
className="text-blue-600 hover:text-blue-800"
>
<Pencil size={16}/>
</button>

<button
onClick={()=>deleteCollection(c._id)}
className="text-red-600 hover:text-red-800"
>
<Trash size={16}/>
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>



{/* PAGINATION */}

<div className="max-w-7xl flex justify-between items-center mt-5 text-sm">

<div className="text-gray-500">

Showing {start + 1} -
{Math.min(start + perPage, filtered.length)} of {filtered.length}

</div>

<div className="flex gap-2">

<button
disabled={page === 1}
onClick={()=>setPage(page - 1)}
className="px-3 py-1 border rounded disabled:opacity-40"
>
Prev
</button>

<button
disabled={page === totalPages}
onClick={()=>setPage(page + 1)}
className="px-3 py-1 border rounded disabled:opacity-40"
>
Next
</button>

</div>

</div>


</div>

)

}