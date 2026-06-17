import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function ShopProfile() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    shop_name: "",
    category: "",
    address: "",
    opening_time: "",
    closing_time: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchShopProfile();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setCategories(data || []);
  }

  async function fetchShopProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from("shop_profiles")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setMessage(t("couldNotLoadShopProfile"));
      setLoading(false);
      return;
    }

    if (data) {
      setForm({
        shop_name: data.shop_name || "",
        category: data.category || "",
        address: data.address || "",
        opening_time: data.opening_time || "",
        closing_time: data.closing_time || "",
      });
    }

    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(t("savingShopProfile"));

    const { error } = await supabase.from("shop_profiles").upsert(
      {
        owner_id: user.id,
        shop_name: form.shop_name,
        category: form.category,
        address: form.address,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
      },
      {
        onConflict: "owner_id",
      }
    );

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("shopProfileSavedSuccess"));
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("ownerPanel")}</p>
            <h1>{t("loadingShopProfile")}</h1>
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
          <p className="tagline">{t("ownerPanel")}</p>
          <h1>{t("shopProfile")}</h1>
          <p>
            {t("shopProfilePageDesc")}
          </p>
        </div>

        <div className="form-card wide-form">
          <h2>{t("hello")}, {profile?.name}</h2>
          <p className="subtitle">{t("completeShopProfile")}</p>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label>{t("shopName")}</label>
            <input
              type="text"
              placeholder={t("shopNamePlaceholder")}
              value={form.shop_name}
              onChange={(e) =>
                setForm({ ...form, shop_name: e.target.value })
              }
              required
            />

            <label>{t("shopCategory")}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">{t("selectCategory")}</option>

              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <label>{t("shopAddress")}</label>
            <textarea
              rows="4"
              placeholder={t("shopAddressPlaceholder")}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />

            <label>{t("openingTime")}</label>
            <input
              type="time"
              value={form.opening_time}
              onChange={(e) =>
                setForm({ ...form, opening_time: e.target.value })
              }
            />

            <label>{t("closingTime")}</label>
            <input
              type="time"
              value={form.closing_time}
              onChange={(e) =>
                setForm({ ...form, closing_time: e.target.value })
              }
            />

            <button type="submit" className="primary-btn">
              {t("saveShopProfile")}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default ShopProfile;