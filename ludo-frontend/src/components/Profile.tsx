import React from "react";
import { getCurrentUser } from "../services/auth.service";

const Profile: React.FC = () => {
  const currentUser = getCurrentUser();

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>
          <strong>{currentUser.username}</strong> Profile
        </h3>
      </header>

      <p>
        <strong>Id:</strong> {currentUser.username}
      </p>
    </div>
  );
};

export default Profile;
