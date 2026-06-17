import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Categories() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.log(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  }

  async function addCategory(e) {
    e.preventDefault();

    const cleanName = newCategory.trim();

    if (!cleanName) {
      setMessage(t("enterCategoryNameMsg"));
      return;
    }

    const alreadyExists = categories.some(
      (category) => category.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      setMessage(t("categoryExistsMsg"));
      return;
    }

    setMessage(t("addingCategory"));

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
    setNewCategory("");
    setMessage(t("categoryAddedSuccess"));
  }

  async function deleteCategory(categoryId) {
    const confirmDelete = window.confirm(
      t("confirmDeleteCategory")
    );

    if (!confirmDelete) return;

    setMessage(t("deletingCategory"));

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setCategories(categories.filter((category) => category.id !== categoryId));
    setMessage(t("categoryDeletedSuccess"));
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("adminPanel")}</p>
            <h1>{t("loadingCategories")}</h1>
            <p>{t("fetchingJobCategories")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("adminPanel")}</p>
          <h1>{t("categories")}</h1>
          <p>{t("categoriesPageDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="admin-panel-card category-panel">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("addCategory")}</p>
              <h2>{t("createNewCategory")}</h2>
            </div>
          </div>

          <form className="category-form" onSubmit={addCategory}>
            <input
              type="text"
              placeholder={t("categoryPlaceholder")}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button type="submit" className="btn btn-primary">
              {t("addCategory")}
            </button>
          </form>
        </div>

        <div className="admin-panel-card">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("allCategories")}</p>
              <h2>{categories.length} {t("categoriesFound")}</h2>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="empty-box">
              <h3>{t("noCategoriesFound")}</h3>
              <p>{t("addFirstCategoryMsg")}</p>
            </div>
          ) : (
            <div className="category-grid-list">
              {categories.map((category) => (
                <div className="category-item" key={category.id}>
                  <span>{category.name}</span>

                  <button
                    className="btn btn-light"
                    onClick={() => deleteCategory(category.id)}
                  >
                    {t("delete")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Categories;