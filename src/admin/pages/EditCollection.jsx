import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/api/api";
import { ArrowLeft } from "lucide-react";

export default function EditCollection(){

const { id } = useParams();
const navigate = useNavigate();

const [loading,setLoading] = useState(true);

const [imagePreview,setImagePreview] = useState("");
const [imageFile,setImageFile] = useState(null);

const [form,setForm] = useState({

name:"",
slug:"",
category:"",
description:"",
image:"",
meta_title:"",
meta_description:"",
is_active:true

});


/* ========================
FETCH COLLECTION
======================== */

useEffect(()=>{

fetchCollection();

},[]);

const fetchCollection = async()=>{

try{

const res = await API.get("/admin/collections");

const col = res.data.find(c => c._id === id);

if(col){

setForm({

name:col.name || "",
slug:col.slug || "",
category:col.category || "",
description:col.description || "",
image:col.image || "",
meta_title:col.seo?.meta_title || "",
meta_description:col.seo?.meta_description || "",
is_active:col.is_active

});

setImagePreview(col.image || "");

}

}catch(err){

console.error(err);

}finally{

setLoading(false);

}

};


/* ========================
FORM CHANGE
======================== */

const handleChange = (e)=>{

const {name,value,type,checked} = e.target;

setForm(prev=>({

...prev,
[name]: type === "checkbox" ? checked : value

}));

};


/* ========================
IMAGE UPLOAD
======================== */

const handleImageUpload = (e)=>{

const file = e.target.files[0];

if(file){

setImageFile(file);

const preview = URL.createObjectURL(file);

setImagePreview(preview);

setForm(prev=>({

...prev,
image:preview

}));

}

};


/* ========================
UPDATE COLLECTION
======================== */

const updateCollection = async()=>{

try{

await API.put(`/admin/collections/${id}`,{

name:form.name,
slug:form.slug,
category:form.category,
description:form.description,
image:form.image,

seo:{
meta_title:form.meta_title,
meta_description:form.meta_description
},

is_active:form.is_active

});

alert("Collection Updated");

navigate("/admin/collections");

}catch(err){

console.error(err);

}

};


if(loading){

return <div className="p-10">Loading...</div>

}


/* ========================
UI
======================== */

return(

<div className="p-10 bg-gray-50 min-h-screen">

<div className="max-w-4xl mx-auto">

{/* HEADER */}

<div className="flex items-center gap-3 mb-8">

<button
onClick={()=>navigate("/admin/collections")}
className="p-2 hover:bg-gray-200 rounded"
>
<ArrowLeft size={22}/>
</button>

<h1 className="text-3xl font-bold">
Edit Collection
</h1>

</div>


<div className="bg-white shadow rounded-xl border p-8 space-y-6">


{/* NAME */}

<div>

<label className="text-sm text-gray-600">
Collection Name
</label>

<input
name="name"
value={form.name}
onChange={handleChange}
className="w-full border p-3 rounded mt-1"
/>

</div>


{/* SLUG */}

<div>

<label className="text-sm text-gray-600">
Slug
</label>

<input
name="slug"
value={form.slug}
onChange={handleChange}
className="w-full border p-3 rounded mt-1"
/>

</div>


{/* CATEGORY */}

<div>

<label className="text-sm text-gray-600">
Category
</label>

<input
name="category"
value={form.category}
onChange={handleChange}
className="w-full border p-3 rounded mt-1"
/>

</div>


{/* DESCRIPTION */}

<div>

<label className="text-sm text-gray-600">
Description
</label>

<textarea
name="description"
value={form.description}
onChange={handleChange}
className="w-full border p-3 rounded mt-1"
rows="4"
/>

</div>


{/* IMAGE UPLOAD */}

<div>

<label className="text-sm text-gray-600">
Upload Collection Image
</label>

<input
type="file"
accept="image/*"
onChange={handleImageUpload}
className="w-full border p-3 rounded mt-1"
/>

</div>


{/* IMAGE PREVIEW */}

{imagePreview && (

<img
src={imagePreview}
alt="collection"
className="w-40 rounded border mt-3"
/>

)}


{/* SEO */}

<div className="border-t pt-6 space-y-4">

<h2 className="font-semibold">
SEO
</h2>

<input
name="meta_title"
value={form.meta_title}
onChange={handleChange}
className="w-full border p-3 rounded"
placeholder="Meta Title"
/>

<textarea
name="meta_description"
value={form.meta_description}
onChange={handleChange}
className="w-full border p-3 rounded"
placeholder="Meta Description"
/>

</div>


{/* ACTIVE */}

<div className="flex items-center gap-2">

<input
type="checkbox"
name="is_active"
checked={form.is_active}
onChange={handleChange}
/>

<label>Active</label>

</div>


{/* BUTTON */}

<button
onClick={updateCollection}
className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
>

Update Collection

</button>


</div>

</div>

</div>

)

}