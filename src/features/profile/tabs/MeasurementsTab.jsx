import { useProfile } from "@/hooks/useProfile";
import { profileAPI } from "@/features/profile/api/profile.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const inputClass =
  "w-full bg-white border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-royal-plum";

const MeasurementsTab = () => {
  const { measurements, reload, loading } = useProfile();

  const initialForm = {
    profile_name: "",

    // TOP
    bust: "",
    underbust: "",
    shoulder: "",
    armhole: "",
    waist: "",
    top_length: "",

    // BOTTOM
    hip: "",
    thigh: "",
    knee: "",
    calf: "",
    ankle: "",
    crotch_rise: "",
    bottom_length: "",
  };

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const update = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  /* ================= SAVE (UPDATED WITH PRODUCTION SAFE TRANSFORM) ================= */
  const save = async () => {
    if (!form.profile_name.trim()) {
      alert("Please enter profile name");
      return;
    }

    try {
      setSaving(true);

      // Helper to convert to Number or return null if empty
      const num = (v) => (v ? Number(v) : null);

      // Transforming form data to match backend schema with numeric values
      const payload = {
        profile_name: form.profile_name,
        body_type: "regular",
        fitting_preference: "regular",
        measurements: {
          bust: num(form.bust),
          underbust: num(form.underbust),
          shoulder: num(form.shoulder),
          armhole: num(form.armhole),
          waist_top: num(form.waist),
          length_top: num(form.top_length),

          hip: num(form.hip),
          thigh: num(form.thigh),
          knee: num(form.knee),
          calf: num(form.calf),
          ankle: num(form.ankle),
          crotch_rise: num(form.crotch_rise),
          length_bottom: num(form.bottom_length),
        },
      };

      await profileAPI.saveMeasurements(payload);

      // reset form after save
      setForm(initialForm);

      await reload();
    } catch (e) {
      console.error("Measurement save failed", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500">Loading measurements...</p>
    );

  return (
    <div className="space-y-6">

      {/* ================= CREATE PROFILE ================= */}
      <Card>
        <CardContent className="p-6 space-y-6">

          <h3 className="text-lg font-semibold">
            Create Measurement Profile
          </h3>

          <input
            className={inputClass}
            placeholder="Profile Name (Self / Mom / Bride)"
            value={form.profile_name}
            onChange={(e) => update("profile_name", e.target.value)}
          />

          {/* ========= TOP ========= */}
          <div>
            <h4 className="font-semibold text-royal-plum mb-3">
              👚 Top Measurements
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "bust",
                "underbust",
                "shoulder",
                "armhole",
                "waist",
                "top_length",
              ].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm capitalize text-gray-600">
                    {field.replace("_", " ")}
                  </label>

                  <input
                    type="number"
                    step="0.5"
                    className={inputClass}
                    placeholder={field.replace("_", " ")}
                    value={form[field]}
                    onChange={(e) =>
                      update(field, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ========= BOTTOM ========= */}
          <div>
            <h4 className="font-semibold text-royal-plum mb-3">
              👖 Bottom Measurements
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "hip",
                "thigh",
                "knee",
                "calf",
                "ankle",
                "crotch_rise",
                "bottom_length",
              ].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm capitalize text-gray-600">
                    {field.replace("_", " ")}
                  </label>

                  <input
                    type="number"
                    step="0.5"
                    className={inputClass}
                    placeholder={field.replace("_", " ")}
                    value={form[field]}
                    onChange={(e) =>
                      update(field, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ================= SAVE BUTTON ================= */}
          <div className="border-t border-silk-border pt-4">
            <Button
              onClick={save}
              disabled={saving}
              className="
                w-full
                bg-royal-plum
                hover:bg-royal-plum/90
                text-white
                font-semibold
                py-5
              "
            >
              {saving ? "Saving..." : "Save Measurement Profile"}
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* ================= SAVED PROFILES ================= */}
      <div>
        <h3 className="font-semibold mb-3">
          Saved Measurement Profiles
        </h3>

        {!measurements || measurements.length === 0 ? (
          <p className="text-sm text-gray-500">
            No measurement profiles saved yet.
          </p>
        ) : (
          measurements.map((m, i) => (
            <Card key={i} className="mb-3">
              <CardContent className="p-4">
                <p className="font-medium">
                  {m.profile_name}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
};

export default MeasurementsTab;