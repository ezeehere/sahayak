import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext";

function ShopVerification() {
  const { t } = useLanguage();

  const [shops, setShops] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  async function fetchShops() {
    setLoading(true);

    const { data, error } = await supabase
      .from("shop_profiles")
      .select(`
        *,
        profiles (
          name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage(error.message);
    } else {
      setShops(data || []);
    }

    setLoading(false);
  }

  async function updateShopVerification(shop, verificationStatus) {
    setMessage(t("updatingVerification"));

    const isVerified = verificationStatus === "verified";

    const { error } = await supabase
      .from("shop_profiles")
      .update({
        verification_status: verificationStatus,
        is_verified: isVerified,
        phone_verified: isVerified ? true : shop.phone_verified,
        verified_at: isVerified ? new Date().toISOString() : null,
      })
      .eq("id", shop.id);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("verificationUpdated"));
    fetchShops();
  }

  async function togglePhoneVerified(shop) {
    setMessage(t("updatingVerification"));

    const { error } = await supabase
      .from("shop_profiles")
      .update({
        phone_verified: !shop.phone_verified,
      })
      .eq("id", shop.id);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("verificationUpdated"));
    fetchShops();
  }

  function getStatusLabel(status) {
    if (status === "verified") return t("verified");
    if (status === "rejected") return t("rejected");
    return t("pending");
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("trustAndSafety")}</p>
          <h1>{t("shopVerification")}</h1>
          <p>{t("shopVerificationDesc")}</p>
        </div>

        <div className="admin-form-card">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("verificationQueue")}</p>
              <h2>{t("shops")}</h2>
            </div>

            <Link to="/admin/dashboard" className="btn btn-light">
              <ArrowLeft size={17} strokeWidth={2.7} />
              {t("back")}
            </Link>
          </div>

          {message && <div className="message">{message}</div>}

          {loading ? (
            <div className="empty-state">{t("loading")}</div>
          ) : shops.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={36} strokeWidth={2.5} />
              <h3>{t("noShopsFound")}</h3>
              <p>{t("noShopsFoundDesc")}</p>
            </div>
          ) : (
            <div className="shop-verification-list">
              {shops.map((shop) => (
                <div className="shop-verification-card" key={shop.id}>
                  <div className="shop-verification-top">
                    <span className="shop-verification-icon">
                      <Building2 size={20} strokeWidth={2.7} />
                    </span>

                    <div>
                      <h3>{shop.shop_name}</h3>
                      <p>
                        {shop.category} • {shop.address}
                      </p>
                    </div>

                    <span
                      className={`verification-status-pill ${
                        shop.verification_status || "pending"
                      }`}
                    >
                      {getStatusLabel(shop.verification_status)}
                    </span>
                  </div>

                  <div className="shop-verification-info">
                    <div>
                      <strong>{t("owner")}</strong>
                      <p>{shop.profiles?.name || t("notAvailable")}</p>
                    </div>

                    <div>
                      <strong>{t("phone")}</strong>
                      <p>{shop.profiles?.phone || t("notAvailable")}</p>
                    </div>

                    <div>
                      <strong>{t("email")}</strong>
                      <p>{shop.profiles?.email || t("notAvailable")}</p>
                    </div>

                    <div>
                      <strong>{t("phoneStatus")}</strong>
                      <p>
                        {shop.phone_verified
                          ? t("phoneVerified")
                          : t("phoneNotVerified")}
                      </p>
                    </div>
                  </div>

                  <div className="shop-verification-actions">
                    <button
                      type="button"
                      className="btn verify-shop-btn"
                      onClick={() => updateShopVerification(shop, "verified")}
                    >
                      <ShieldCheck size={16} strokeWidth={2.7} />
                      {t("verifyShop")}
                    </button>

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => togglePhoneVerified(shop)}
                    >
                      <Phone size={16} strokeWidth={2.7} />
                      {shop.phone_verified
                        ? t("unverifyPhone")
                        : t("verifyPhone")}
                    </button>

                    <button
                      type="button"
                      className="btn reject-shop-btn"
                      onClick={() => updateShopVerification(shop, "rejected")}
                    >
                      <XCircle size={16} strokeWidth={2.7} />
                      {t("reject")}
                    </button>
                  </div>

                  {shop.is_verified && (
                    <div className="verified-shop-note">
                      <BadgeCheck size={17} strokeWidth={2.7} />
                      <span>{t("verifiedShopTrustNote")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default ShopVerification;
