const AVATAR_CLASSES = [
  "bg-ind-azul", "bg-verde-100", "bg-ind-naranja", "bg-ind-morado",
  "bg-ind-rojo", "bg-ind-acua", "bg-corp-darkblue", "bg-corp-green",
];

const USER_COLORS: Record<string, string> = {
  "María Fernanda López": "bg-ind-azul",
  "Carlos Mendoza": "bg-verde-100",
  "Ana Sofía Torres": "bg-ind-naranja",
  "José Gregorio Rivas": "bg-corp-green",
  "Rosa Elena Martínez": "bg-ind-rojo",
  "Luis Daniel Peña": "bg-ind-acua",
  "Fabián Dávila": "bg-corp-darkblue",
  "Sin asignar": "bg-ind-morado",
};

const usedColors = new Set(Object.values(USER_COLORS));
let nextColorIdx = 0;

export function getUserColor(name: string): string {
  if (USER_COLORS[name]) return USER_COLORS[name];
  const fallback = AVATAR_CLASSES[nextColorIdx % AVATAR_CLASSES.length];
  while (usedColors.has(fallback) && nextColorIdx < AVATAR_CLASSES.length * 2) {
    nextColorIdx++;
  }
  USER_COLORS[name] = fallback;
  usedColors.add(fallback);
  nextColorIdx++;
  return fallback;
}

export function getNameInitials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}
