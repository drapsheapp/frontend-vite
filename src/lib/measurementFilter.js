export const getMeasurementsByCategory = (category, measurements = {}) => {

const cat = (category || "").toLowerCase()

/* TOP MEASUREMENTS (Blouse / Kameez) */

const topKeys = [
"bust",
"underbust",
"shoulder",
"armhole",
"waist_top",
"length_top"
]

/* BOTTOM MEASUREMENTS (Pant / Salwar) */

const bottomKeys = [
"waist_bottom",
"hip",
"thigh",
"knee",
"calf",
"ankle",
"crotch_rise",
"length_bottom"
]

const top = []
const bottom = []

Object.entries(measurements).forEach(([k,v]) => {

const key = k.toLowerCase()

/* BLOUSE */

if(cat.includes("blouse")){

if(topKeys.includes(key)){
top.push([k,v])
}

}

/* PANT */

else if(cat.includes("pant")){

if(bottomKeys.includes(key)){
bottom.push([k,v])
}

}

/* SALWAR KAMEEZ / KURTA SET */

else if(
cat.includes("salwar_kameez") ||
cat.includes("kurta_set") ||
cat.includes("kurta")
){

if(topKeys.includes(key)){
top.push([k,v])
}

if(bottomKeys.includes(key)){
bottom.push([k,v])
}

}

/* FALLBACK */

else{

if(topKeys.includes(key)) top.push([k,v])
if(bottomKeys.includes(key)) bottom.push([k,v])

}

})

return { top, bottom }

}