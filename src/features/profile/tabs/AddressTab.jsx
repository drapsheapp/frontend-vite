import { useProfile } from "@/hooks/useProfile";
import { profileAPI } from "@/features/profile/api/profile.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

const emptyForm = {
  name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
};

const AddressTab = () => {
  const { addresses, reload, loading } = useProfile();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  /* ================= RESTORE DEFAULT ADDRESS ================= */
  useEffect(() => {
    const saved = localStorage.getItem("default_address_id");
    if (saved) {
      setSelectedAddressId(saved);
    }
  }, []);

  /* ================= VALIDATION ================= */
  const isValid =
    form.name &&
    form.phone &&
    form.address_line1 &&
    form.city &&
    form.state &&
    form.pincode;

  /* ================= SAVE ADDRESS ================= */
  const handleSave = async () => {
    if (!isValid) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await profileAPI.updateAddress(editingId, form);
      } else {
        await profileAPI.addAddress(form);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await reload();
    } catch (e) {
      console.error("Address save failed", e);
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ADDRESS ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;

    try {
      await profileAPI.deleteAddress(id);

      if (selectedAddressId === id) {
        localStorage.removeItem("default_address_id");
        setSelectedAddressId(null);
      }

      await reload();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  /* ================= EDIT ADDRESS ================= */
  const handleEdit = (address) => {
    setEditingId(address._id);

    setForm({
      name: address.name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setShowForm(true);
  };

  /* ================= SET DEFAULT ================= */
  const handleSetDefault = async (id) => {
    try {
      await profileAPI.setDefaultAddress(id);

      setSelectedAddressId(id);
      localStorage.setItem("default_address_id", id);

      await reload();
    } catch (e) {
      console.error("Default set failed", e);
    }
  };

  /* ================= SELECT ADDRESS ================= */
  const selectAddress = (id) => {
    setSelectedAddressId(id);
    localStorage.setItem("default_address_id", id);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Loading saved addresses...
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Saved Addresses
        </h2>

        <Button
          variant="outline"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "Add New Address"}
        </Button>
      </div>

      {/* ================= ADD / EDIT FORM ================= */}
      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-3">

            <input
              className="w-full border rounded-md p-2"
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="w-full border rounded-md p-2"
              placeholder="Phone *"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              className="w-full border rounded-md p-2"
              placeholder="Address Line 1 *"
              value={form.address_line1}
              onChange={(e) =>
                setForm({
                  ...form,
                  address_line1: e.target.value,
                })
              }
            />

            <input
              className="w-full border rounded-md p-2"
              placeholder="Address Line 2"
              value={form.address_line2}
              onChange={(e) =>
                setForm({
                  ...form,
                  address_line2: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-3 gap-3">
              <input
                className="border rounded-md p-2"
                placeholder="City *"
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
              />

              <input
                className="border rounded-md p-2"
                placeholder="State *"
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value })
                }
              />

              <input
                className="border rounded-md p-2"
                placeholder="Pincode *"
                value={form.pincode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pincode: e.target.value,
                  })
                }
              />
            </div>

            <Button
              className="w-full mt-2"
              disabled={!isValid || saving}
              onClick={handleSave}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Address"
                : "Save Address"}
            </Button>

          </CardContent>
        </Card>
      )}

      {/* ================= ADDRESS LIST ================= */}
      {addresses.length === 0 ? (
        <div className="text-sm text-gray-500">
          No saved addresses yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((a, i) => {
            const id = a._id || i;

            return (
              <Card
                key={id}
                className={`cursor-pointer transition border ${
                  a.is_default
                    ? "border-rose-600 ring-1 ring-rose-600"
                    : ""
                }`}
                onClick={() => selectAddress(id)}
              >
                <CardContent className="p-4 space-y-2">

                  <div className="flex justify-between items-start">
                    <p className="font-medium">
                      {a.full_name || a.name}
                    </p>

                    {a.is_default && (
                      <span className="text-xs text-rose-600 font-semibold">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    {a.house_no || a.address_line1}
                    {(a.area || a.address_line2) &&
                      `, ${a.area || a.address_line2}`}
                  </p>

                  <p className="text-sm text-gray-600">
                    {a.city}, {a.state} — {a.pincode}
                  </p>

                  <p className="text-sm text-gray-600">
                    📞 {a.mobile || a.phone}
                  </p>

                  <div className="flex gap-4 pt-2">

                    {!a.is_default && (
                      <button
                        className="text-green-600 text-sm hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(a._id);
                        }}
                      >
                        Set as Default
                      </button>
                    )}

                    <button
                      className="text-blue-600 text-sm hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(a);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="text-red-600 text-sm hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(a._id);
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressTab;