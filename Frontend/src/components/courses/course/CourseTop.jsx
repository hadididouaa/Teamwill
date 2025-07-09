import React from "react";

const CourseTop = ({ totalItems }) => {
  return (
    <div className="courses-top-wrap">
      <div className="row align-items-center">
        <div className="col-md-5">
          <div className="courses-top-left">
            <p>
              Affichage de 1 sur {totalItems} formation
              {totalItems > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseTop;
