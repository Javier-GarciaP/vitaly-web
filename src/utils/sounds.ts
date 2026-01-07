import useSound from 'use-sound';

export const useAppSounds = () => {
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.4 });
  const [playDelete] = useSound('/sounds/delete.mp3', { volume: 0.4 });
  //const [playError] = useSound('/sounds/error.mp3', { volume: 0.2 }); // Volumen más bajo porque suele ser molesto
  const [playIn] = useSound('/sounds/in.mp3', { volume: 0.3 });

  return { playSuccess, playDelete, playIn };
};