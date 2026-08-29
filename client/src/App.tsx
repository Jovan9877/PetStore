import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { IPetAPI } from "./api/pets/IPetAPI";
import { PetAPI } from "./api/pets/PetAPI";
import { IUserAPI } from "./api/users/IUserAPI";
import { UserAPI } from "./api/users/UserAPI";
import { IPetSittingAPI } from "./api/pet_sitting/IPetSittingAPI";
import { PetSittingAPI } from "./api/pet_sitting/PetSittingAPI";
import { IShelterAPI } from "./api/shelters/IShelterAPI";
import { ShelterAPI } from "./api/shelters/ShelterAPI";

const auth_api: IAuthAPI = new AuthAPI();
const pet_api: IPetAPI = new PetAPI();
const user_api: IUserAPI = new UserAPI();
const pet_sitting_api: IPetSittingAPI = new PetSittingAPI();
const shelter_api: IShelterAPI = new ShelterAPI();

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="manager,seller">
              <DashboardPage petAPI={pet_api} userAPI={user_api} petSittingAPI={pet_sitting_api} shelterAPI={shelter_api} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<AuthPage authAPI={auth_api} />} />
        <Route path="*" element={<div className="overlay"><div className="window" style={{ padding: 32 }}><h2>Page not found</h2><p>The requested page does not exist.</p></div></div>} />
      </Routes>
    </>
  );
}

export default App;
