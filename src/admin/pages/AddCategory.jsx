import { useState } from "react";
import { adminAPI } from "../api/admin.api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AddCategory = () => {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [slug,setSlug] = useState("");
  const [description,setDescription] = useState("");
  const [image,setImage] = useState("");
  const [imageFile,setImageFile] = useState(null);
  const [metaTitle,setMetaTitle] = useState("");
  const [metaDescription,setMetaDescription] = useState("");
  const [active,setActive] = useState(true);

  const generateSlug = (value) => {

    const s = value
      .toLowerCase()
      .replace(/\s+/g,"-")
      .replace(/[^\w-]+/g,"");

    setSlug(s);

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await adminAPI.createCategory({

        name:name.toLowerCase(),
        display_name:name,
        slug,
        description,
        image,

        seo:{
          meta_title:metaTitle,
          meta_description:metaDescription
        },

        is_active:active

      });

      navigate("/admin/categories");

    } catch(err){

      console.log(err);

    }

  };

  return(

  <div className="p-10 bg-gray-50 min-h-screen flex justify-center">

    {/* WHITE CARD */}

    <div className="bg-white shadow-lg rounded-xl border p-10 w-full max-w-3xl">

      {/* HEADER */}

      <div className="flex items-center gap-3 mb-8">

        <button
          onClick={()=>navigate("/admin/categories")}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft size={22}/>
        </button>

        <h1 className="text-3xl font-bold text-gray-800">
          Add Category
        </h1>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">


        {/* CATEGORY NAME */}

        <div>

          <label className="text-sm text-gray-600">
            Category Name
          </label>

          <input
            value={name}
            onChange={(e)=>{
              setName(e.target.value)
              generateSlug(e.target.value)
            }}
            className="w-full border border-gray-300 rounded-md px-4 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Blouse"
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
            Upload Category Image
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
            alt="category"
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
          Create Category
        </button>


      </form>

    </div>

  </div>

  );

};

export default AddCategory;