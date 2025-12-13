import { userRequest } from "../../requestMethod";
import { registerStart, registerSuccess, registerFailure } from "../userRedux";

export const registerUser = async (dispatch, user) => {
  dispatch(registerStart());
  try {
    const res = await userRequest.post("/auth/register", user);
    dispatch(registerSuccess());
    return res.data;
  } catch (err) {
    dispatch(registerFailure());
    throw err;
  }
};