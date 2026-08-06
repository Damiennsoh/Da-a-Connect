import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./Utility/supabase";
import { useCart } from "./components/DataProvider/DataProvider";
import { ACTIONS } from "./Utility/actions";
import "./App.css";
import AppRouter from "./Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTopFab from "./components/ScrollToTopFab/ScrollToTopFab";

function App() {
  const { dispatch } = useCart();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      dispatch({ type: ACTIONS.SET_USER, payload: null });
      return undefined;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: ACTIONS.SET_USER, payload: session?.user ?? null });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: ACTIONS.SET_USER, payload: session?.user ?? null });
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <>
      <AppRouter />
      <ScrollToTopFab />
    </>
  );
}

export default App;
