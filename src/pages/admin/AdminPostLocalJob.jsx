import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function AdminPostLocalJob() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        shopName: "",
        shopPhone: "",
        shopAddress: "",
        shopCategory: "",
        title: "",
        expiresAt: "",
        category: "",
        description: "",
        jobType: "part-time",
        salary: "",
        timing: "",
        location: "",
        status: "approved",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true });

        if (!error) {
            setCategories(data || []);
        }
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!user?.id) {
            setMessage("Please login again.");
            return;
        }

        setMessage("Posting local job...");

        const { error } = await supabase.from("jobs").insert({
            owner_id: user.id,
            shop_id: null,

            title: form.title,
            category: form.category,
            description: form.description,
            job_type: form.jobType,
            salary: form.salary,
            timing: form.timing,
            location: form.location,
            status: form.status,

            hiring_status: "open",
            expires_at: form.expiresAt || null,
            last_checked_at: new Date().toISOString(),

            posted_by_admin: true,
            offline_shop_name: form.shopName,
            offline_shop_phone: form.shopPhone,
            offline_shop_address: form.shopAddress,
            offline_shop_category: form.shopCategory || form.category,
            offline_shop_verified: true,
        });

        if (error) {
            console.log(error);
            setMessage(error.message);
            return;
        }

        setMessage("Local job posted successfully.");

        setForm({
            shopName: "",
            shopPhone: "",
            shopAddress: "",
            shopCategory: "",
            title: "",
            category: "",
            description: "",
            jobType: "part-time",
            salary: "",
            timing: "",
            location: "",
            status: "approved",
            expiresAt: "",
        });
    }

    return (
        <>
            <Navbar />

            <main className="dashboard-section">
                <div className="dashboard-header admin-assisted-header">
                    <p className="tagline">Admin Assisted Posting</p>
                    <h1>Post Local Job</h1>
                    <p>
                        Add a shop vacancy manually when the shop owner is not using the
                        platform yet.
                    </p>
                </div>

                <div className="admin-form-card">
                    <div className="section-title-row">
                        <div>
                            <p className="tagline">Offline Shop</p>
                            <h2>Shop and Job Details</h2>
                        </div>

                        <Link to="/admin/dashboard" className="btn btn-light">
                            <ArrowLeft size={17} strokeWidth={2.7} />
                            Back
                        </Link>
                    </div>

                    {message && <div className="message">{message}</div>}

                    <form onSubmit={handleSubmit} className="admin-assisted-form">
                        <div className="form-subsection">
                            <h3>Shop Details</h3>

                            <div className="form-grid">
                                <div>
                                    <label>Shop Name</label>
                                    <input
                                        name="shopName"
                                        value={form.shopName}
                                        onChange={handleChange}
                                        placeholder="Example: Sahayak Demo Store"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Shop Phone</label>
                                    <input
                                        name="shopPhone"
                                        value={form.shopPhone}
                                        onChange={handleChange}
                                        placeholder="Owner phone number"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Shop Category</label>
                                    <input
                                        name="shopCategory"
                                        value={form.shopCategory}
                                        onChange={handleChange}
                                        placeholder="Pharmacy, Grocery, Restaurant..."
                                    />
                                </div>

                                <div>
                                    <label>Shop Address</label>
                                    <input
                                        name="shopAddress"
                                        value={form.shopAddress}
                                        onChange={handleChange}
                                        placeholder="AT Road, Jorhat"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-subsection">
                            <h3>Job Details</h3>

                            <div className="form-grid">
                                <div>
                                    <label>Job Title</label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Pharmacy Helper"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select category</option>

                                        {categories.map((item) => (
                                            <option value={item.name} key={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Job Type</label>
                                    <select
                                        name="jobType"
                                        value={form.jobType}
                                        onChange={handleChange}
                                    >
                                        <option value="part-time">Part-time</option>
                                        <option value="full-time">Full-time</option>
                                        <option value="daily">Daily</option>
                                        <option value="temporary">Temporary</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Salary</label>
                                    <input
                                        name="salary"
                                        value={form.salary}
                                        onChange={handleChange}
                                        placeholder="₹6,000/month"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Timing</label>
                                    <input
                                        name="timing"
                                        value={form.timing}
                                        onChange={handleChange}
                                        placeholder="5 PM to 9 PM"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Location</label>
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="Jorhat Town"
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiresAt"
                                        value={form.expiresAt}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Explain the work, responsibilities, and requirements."
                                    rows="5"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary admin-post-submit">
                            <PlusCircle size={18} strokeWidth={2.7} />
                            Post Local Job
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}

export default AdminPostLocalJob;