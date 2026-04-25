import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/api";
import { ArrowLeft } from "lucide-react";

export default function AddCollection(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [slug,setSlug] = useState("");
const [category,setCategory] = useState("");
const [description,setDescription] = useState("");

const [image,setImage] = useState("");
const [imageFile,setImageFile] = useState(null);

const [metaTitle,setMetaTitle] = useState("");
const [metaDescription,setMetaDescription] = useState("");

const [active,setActive] = useState(true);


/* =========================
SLUG GENERATE
========================= */

const generateSlug = (value)=>{

const s = value
.toLowerCase()
.replace(/\s+/g,"-")
.replace(/[^\w-]+/g,"");

setSlug(s);

};


/* =========================
CREATE COLLECTION
========================= */

const createCollection = async(e)=>{

e.preventDefault();

try{

await API.post("/admin/collections",{

name,
slug,
category,
description,
image,

seo:{
meta_title:metaTitle,
meta_description:metaDescription
},

is_active:active

});

alert("Collection Created");

navigate("/admin/collections");

}catch(err){

console.error(err);

}

};


/* =========================
UI
========================= */

return(

<div className="p-10 bg-gray-50 min-h-screen flex justify-center">

<div className="bg-white shadow-lg rounded-xl border p-10 w-full max-w-3xl">

{/* HEADER */}

<div className="flex items-center gap-3 mb-8">

<button
onClick={()=>navigate("/admin/collections")}
className="p-2 rounded-md hover:bg-gray-100"
>
<ArrowLeft size={22}/>
</button>

<h1 className="text-3xl font-bold text-gray-800">
Add Collection
</h1>

</div>

<form onSubmit={createCollection} className="space-y-6">


{/* NAME */}

<div>

<label className="text-sm text-gray-600">
Collection Name
</label>

<input
value={name}
onChange={(e)=>{
setName(e.target.value)
generateSlug(e.target.value)
}}
className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
placeholder="Boat Neck Blouse"
/>

</div>


{/* SLUG */}

<div>

<label className="text-sm text-gray-600">
Slug
</label>

<input
value={slug}
onChange={(e)=>setSlug(e.target.value)}
className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
/>

</div>


{/* CATEGORY */}

<div>

<label className="text-sm text-gray-600">
Category
</label>

<input
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
placeholder="blouse"
/>

</div>


{/* DESCRIPTION */}

<div>

<label className="text-sm text-gray-600">
Description
</label>

<textarea
value={description}
onChange={(e)=>setDescription(e.target.value)}
className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
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
onChange={(e)=>{

const file = e.target.files[0];

if(file){

setImageFile(file);
setImage(URL.createObjectURL(file));

}

}}
className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1"
/>

</div>


{/* IMAGE PREVIEW */}

{image && (

<img
src={image}
alt="collection"
className="w-40 rounded border mt-3"
/>

)}


{/* SEO */}

<div className="border-t pt-6">

<h3 className="font-medium mb-4">
SEO Settings
</h3>

<div className="space-y-4">

<input
placeholder="Meta Title"
value={metaTitle}
onChange={(e)=>setMetaTitle(e.target.value)}
className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
/>

<textarea
placeholder="Meta Description"
value={metaDescription}
onChange={(e)=>setMetaDescription(e.target.value)}
className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
/>

</div>

</div>


{/* ACTIVE */}

<div className="flex items-center gap-2">

<input
type="checkbox"
checked={active}
onChange={(e)=>setActive(e.target.checked)}
/>

<span>Active</span>

</div>


{/* BUTTON */}

<button
type="submit"
className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
>
Create Collection
</button>


</form>

</div>

</div>

)

}