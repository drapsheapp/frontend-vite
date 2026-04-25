import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getLatestDraft,
  createOrGetDraft,
  updateDraft,
} from "@/api/draftApi";

import {
  saveLocalDraft,
  getLocalDraft,
  clearLocalDraft,
} from "@/utils/draftStorage";

import { useAuth } from "@/context/AuthContext";

/* =========================================================
   CONTEXT CREATE
========================================================= */

const ProductCustomizationContext = createContext(null);

export const useProductCustomization = () =>
  useContext(ProductCustomizationContext);

/* =========================================================
   PROVIDER
========================================================= */

export const ProductCustomizationProvider = ({
  children,
  productId,
}) => {
  const { user } = useAuth();

  /* -------------------------
     CUSTOMIZATION STATE
  ------------------------- */

  const [measurements, setMeasurements] = useState({});
  const [bodyType, setBodyType] = useState("regular");
  const [fittingPreference, setFittingPreference] =
    useState("regular");

  const [selectedSleeve, setSelectedSleeve] = useState("");
  const [selectedNeck, setSelectedNeck] = useState("");
  const [selectedBottom, setSelectedBottom] = useState("");

  /* ⭐ BLOUSE OPTIONS */

  const [padding, setPadding] = useState("no_padd");
  const [opening, setOpening] = useState("back");
  const [closure, setClosure] = useState("hook");

  /* ⭐ PANT / KURTA OPTIONS */

  const [pantType, setPantType] = useState("straight");
  const [waistStyle, setWaistStyle] = useState("back_elastic");
  const [pockets, setPockets] = useState("one_side");

  const [kameezLength, setKameezLength] = useState("knee");
  const [sideSlit, setSideSlit] = useState("normal");
  const [dupatta, setDupatta] = useState("plain");

  const [notes, setNotes] = useState("");

  /* -------------------------
     DRAFT CONTROL STATE
  ------------------------- */

  const [draftId, setDraftId] = useState(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const [saveStatus, setSaveStatus] = useState("idle");

  const saveTimer = useRef(null);
  const hasUserEdited = useRef(false);

  /* =========================================================
     HYDRATE FROM DRAFT
  ========================================================= */

  const hydrateFromDraft = (draft) => {
    const config = draft?.configuration || draft;

    setMeasurements(config.measurements || {});

    setBodyType(
      config.body_type ||
        config.bodyType ||
        "regular"
    );

    setFittingPreference(
      config.fitting_preference ||
        config.fittingPreference ||
        "regular"
    );

    setSelectedSleeve(
      config.sleeve_type ||
        config.selectedSleeve ||
        ""
    );

    setSelectedNeck(
      config.neck_type ||
        config.selectedNeck ||
        ""
    );

    setSelectedBottom(
      config.bottom_type ||
        config.selectedBottom ||
        ""
    );

    /* BLOUSE */

    setPadding(config.padding || "no_padd");
    setOpening(config.opening || "back");
    setClosure(config.closure || "hook");

    /* PANT / KURTA */

    setPantType(config.pantType || "straight");
    setWaistStyle(config.waistStyle || "back_elastic");
    setPockets(config.pockets || "one_side");

    setKameezLength(config.kameezLength || "knee");
    setSideSlit(config.sideSlit || "normal");
    setDupatta(config.dupatta || "plain");

    setNotes(
      config.special_notes ||
        config.notes ||
        ""
    );
  };

  /* =========================================================
     INITIAL HYDRATION
  ========================================================= */

  useEffect(() => {
    const loadDraft = async () => {
      try {
        if (user && productId) {
          const res = await getLatestDraft(productId);

          if (res?.data) {
            hydrateFromDraft(res.data);
            setDraftId(res.data._id);
            setIsDraftLoaded(true);
            return;
          }
        }

        const localDraft = getLocalDraft();

        if (localDraft) {
          hydrateFromDraft(localDraft);
          clearLocalDraft();
        }
      } catch (err) {
        console.error("Draft hydration failed:", err);
      } finally {
        setIsDraftLoaded(true);
      }
    };

    loadDraft();
  }, [user, productId]);

  /* =========================================================
     LOCAL SAVE
  ========================================================= */

  useEffect(() => {
    if (!isDraftLoaded) return;

    const localDraft = {
      configuration: {
        measurements,
        bodyType,
        fittingPreference,
        selectedSleeve,
        selectedNeck,
        selectedBottom,

        padding,
        opening,
        closure,

        pantType,
        waistStyle,
        pockets,

        kameezLength,
        sideSlit,
        dupatta,

        notes,
      },
    };

    saveLocalDraft(localDraft);
  }, [
    measurements,
    bodyType,
    fittingPreference,
    selectedSleeve,
    selectedNeck,
    selectedBottom,
    padding,
    opening,
    closure,
    pantType,
    waistStyle,
    pockets,
    kameezLength,
    sideSlit,
    dupatta,
    notes,
    isDraftLoaded,
  ]);

  /* =========================================================
     USER EDIT DETECTION
  ========================================================= */

  useEffect(() => {
    if (!isDraftLoaded) return;
    hasUserEdited.current = true;
  }, [
    measurements,
    bodyType,
    fittingPreference,
    selectedSleeve,
    selectedNeck,
    selectedBottom,
    padding,
    opening,
    closure,
    pantType,
    waistStyle,
    pockets,
    kameezLength,
    sideSlit,
    dupatta,
    notes,
  ]);

  /* =========================================================
     BACKEND AUTOSAVE
  ========================================================= */

  useEffect(() => {
    if (!user || !isDraftLoaded || !productId) return;
    if (!hasUserEdited.current) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");

        const payload = {
          product_id: productId,
          configuration: {
            measurements,
            body_type: bodyType,
            fitting_preference: fittingPreference,
            sleeve_type: selectedSleeve,
            neck_type: selectedNeck,
            bottom_type: selectedBottom,

            padding,
            opening,
            closure,

            pantType,
            waistStyle,
            pockets,

            kameezLength,
            sideSlit,
            dupatta,

            special_notes: notes,
          },
        };

        if (!draftId) {
          const res = await createOrGetDraft(payload);
          setDraftId(res.data._id);
        } else {
          await updateDraft(draftId, payload);
        }

        setSaveStatus("saved");
        console.log("✅ Draft autosaved");
      } catch (err) {
        console.error("Autosave failed:", err);
        setSaveStatus("error");
      }
    }, 2000);

    return () => clearTimeout(saveTimer.current);
  }, [
    measurements,
    bodyType,
    fittingPreference,
    selectedSleeve,
    selectedNeck,
    selectedBottom,
    padding,
    opening,
    closure,
    pantType,
    waistStyle,
    pockets,
    kameezLength,
    sideSlit,
    dupatta,
    notes,
    user,
    productId,
    draftId,
    isDraftLoaded,
  ]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const value = {
    measurements,
    setMeasurements,

    bodyType,
    setBodyType,

    fittingPreference,
    setFittingPreference,

    selectedSleeve,
    setSelectedSleeve,

    selectedNeck,
    setSelectedNeck,

    selectedBottom,
    setSelectedBottom,

    padding,
    setPadding,

    opening,
    setOpening,

    closure,
    setClosure,

    pantType,
    setPantType,

    waistStyle,
    setWaistStyle,

    pockets,
    setPockets,

    kameezLength,
    setKameezLength,

    sideSlit,
    setSideSlit,

    dupatta,
    setDupatta,

    notes,
    setNotes,

    isDraftLoaded,
    saveStatus,
  };

  return (
    <ProductCustomizationContext.Provider value={value}>
      {children}
    </ProductCustomizationContext.Provider>
  );
};