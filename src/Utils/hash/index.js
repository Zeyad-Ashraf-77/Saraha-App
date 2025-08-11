import bcrypt from "bcrypt";
export const hash = async (data, saltOrRounds = 10) => {
  try {
    return await bcrypt.hashSync(data, Number(saltOrRounds))
  } catch (error) {
    console.error("Hashing failed:", error);
    throw new Error("Hashing failed");
  }
};

export const compare = async (data, hash) => {
  try {
    return await bcrypt.compareSync(data, hash);
  } catch (error) {
    console.error("Comparison failed:", error);
    throw new Error("Comparison failed");
  }
};