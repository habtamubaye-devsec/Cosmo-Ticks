import { userRequest } from "../../requestMethod";
import { loginStart, loginSuccess, loginFailure } from "../userRedux";

export const login = async (dispatch, user) => {
  dispatch(loginStart());

  try {
    const res = await userRequest.post("/auth/login", user);
    dispatch(loginSuccess(res.data));
  } catch (error) {
    dispatch(loginFailure());
  }
};
