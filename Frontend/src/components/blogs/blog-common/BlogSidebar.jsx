import Categories from "./Categories";
import LatestPost from "./LatestPost";  // <-- keep this import
import Tags from "./Tags";

const BlogSidebar = ({ style_1 }) => {
   return (
      <div className="col-xl-3 col-lg-4">
         <aside className={`blog-sidebar ${style_1 ? "blog-sidebar-two" : ""}`}>
            <div className="blog-widget widget_search">
               <div className="sidebar-search-form">
                  <form onSubmit={(e) => e.preventDefault()}>
                     <input type="text" placeholder="Search here" />
                     <button><i className="flaticon-search"></i></button>
                  </form>
               </div>
            </div>
            <Categories />
            <LatestPost />  {/* Using the imported LatestPost */}
            <Tags />
         </aside>
      </div>
   );
};

export default BlogSidebar;
