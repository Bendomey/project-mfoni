import { redirect } from "@remix-run/node";

// This is a 404 page. but because it's a search page, we redirect to the home page
export const loader = () => {
  return redirect("/");
};
