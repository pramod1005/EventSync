import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./Host.css"

function EditEvent() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [eventId, setEventId] = useState(null)
    const [formData, setFormData] = useState({
        title: "", description: "", date: "", time: "",
        venue: "", organiser: "", categories: [],
        reg_start_date: "", reg_end_date: "", price: "", capacity: ""
    })
    const [customFields, setCustomFields] = useState([])
    const [newFieldName, setNewFieldName] = useState("")
    const [newFieldType, setNewFieldType] = useState("text")
    const [coverImage, setCoverImage] = useState(null)
    const [previewCover, setPreviewCover] = useState(null)
    const [selectedImages, setSelectedImages] = useState([])
    const [existingImages, setExistingImages] = useState([]) // ✅

    const categoriesList = [
        "Academics", "Culture", "Sports", "Social", "Tech", "Career",
        "Awareness", "Festivals", "Community", "Competitions", "Workshops",
        "Events", "InterCollege", "Clubs"
    ]

    const formatDate = (d) => d ? new Date(d).toISOString().split("T")[0] : ""

    useEffect(() => {
        fetch(`http://localhost:3000/organizer/editevent/${id}`)
            .then(res => res.json())
            .then(data => {
                setEventId(data.event_id)
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    date: formatDate(data.date),
                    time: data.time || "",
                    venue: data.venue || "",
                    organiser: data.organiser || "",
                    reg_start_date: formatDate(data.reg_start_date),
                    reg_end_date: formatDate(data.reg_end_date),
                    price: data.price || "",
                    capacity: data.capacity || "",
                    categories: data.categories || []
                })
                if (data.cover_image) setPreviewCover(data.cover_image)
                if (data.custom_fields) setCustomFields(data.custom_fields)
                if (data.additionalImages) setExistingImages(data.additionalImages) // ✅
            })
            .catch(err => console.error("Error fetching event:", err))
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target
        setFormData(prev => {
            const updated = checked
                ? [...prev.categories, value]
                : prev.categories.filter(c => c !== value)
            return { ...prev, categories: updated }
        })
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setSelectedImages(prev => [
            ...prev,
            ...files.map(file => ({ file, preview: URL.createObjectURL(file) }))
        ])
    }

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setCoverImage(file)
            setPreviewCover(URL.createObjectURL(file))
        }
    }

    const handleRemoveImage = (i) => {
        setSelectedImages(prev => prev.filter((_, idx) => idx !== i))
    }

    const handleRemoveCoverImage = () => {
        setCoverImage(null)
        setPreviewCover(null)
    }

    const handleAddField = () => {
        if (!newFieldName.trim()) return
        const exists = customFields.some(f => f.name.toLowerCase() === newFieldName.toLowerCase())
        if (exists) return alert("Field already exists")
        setCustomFields(prev => [...prev, { name: newFieldName, type: newFieldType }])
        setNewFieldName("")
        setNewFieldType("text")
    }

    const handleRemoveField = (i) => {
        setCustomFields(prev => prev.filter((_, idx) => idx !== i))
    }

    const handleSubmitStep = async (e) => {
        e.preventDefault()
        const url = "http://localhost:3000/events/update"
        const body = { event_id: eventId, ...formData }

        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        const result = await res.json()
        if (res.ok) setStep(step + 1)
        else alert("Error: " + result.error)
    }

    const handleSubmitImages = async (e) => {
        e.preventDefault()
        const imageData = new FormData()
        imageData.append("event_id", eventId)
        if (coverImage) imageData.append("cover_image", coverImage)
        selectedImages.forEach(i => imageData.append("images", i.file))

        const res = await fetch("http://localhost:3000/events/upload-pics", {
            method: "POST",
            body: imageData
        })

        const result = await res.json()
        if (res.ok) setStep(4)
        else alert("Image upload failed: " + result.error)
    }

    const handleSubmitCustomFields = async (e) => {
        e.preventDefault()
        const res = await fetch("http://localhost:3000/events/custom-fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: eventId, fields: customFields })
        })
        const result = await res.json()
        if (res.ok) setStep(5)
        else alert("Error: " + result.error)
    }

    return (
        <div className="host Main">
            <div className="sections">
                <h3 className={step === 1 ? "active current" : step > 1 ? "active completed" : "inactive"}>Edit Details</h3>
                <h3 className={step === 2 ? "active current" : step > 2 ? "active completed" : "inactive"}>Edit Extra</h3>
                <h3 className={step === 3 ? "active current" : step > 3 ? "active completed" : "inactive"}>Edit Images</h3>
                <h3 className={step === 4 ? "active current" : step > 4 ? "active completed" : "inactive"}>Edit Form</h3>
            </div>

            {step === 1 && (
                <form onSubmit={handleSubmitStep} className="host-form">
                    <h2>Edit Event Details</h2>
                    <table><tbody>
                        <tr><td>Title:</td><td><input type="text" name="title" value={formData.title} onChange={handleChange} required /></td></tr>
                        <tr><td>Description:</td><td><textarea name="description" value={formData.description} onChange={handleChange} required /></td></tr>
                        <tr><td>Date:</td><td><input type="date" name="date" value={formData.date} onChange={handleChange} required /></td></tr>
                        <tr><td>Time:</td><td><input type="time" name="time" value={formData.time} onChange={handleChange} required /></td></tr>
                        <tr><td>Venue:</td><td><input type="text" name="venue" value={formData.venue} onChange={handleChange} required /></td></tr>
                        <tr><td>Categories:</td><td>
                            <div className="categories">
                                {categoriesList.map((c, i) => (
                                    <div key={i} className="each-category">
                                        <input type="checkbox" id={`cat-${i}`} value={c}
                                            checked={formData.categories.includes(c)}
                                            onChange={handleCategoryChange} />
                                        <label htmlFor={`cat-${i}`}>{c}</label>
                                    </div>
                                ))}
                            </div>
                        </td></tr>
                    </tbody></table>
                    <button type="submit">Next</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmitStep} className="host-form">
                    <h2>Edit Extra Details</h2>
                    <table><tbody>
                        <tr><td>Registration Start Date:</td><td><input type="date" name="reg_start_date" value={formData.reg_start_date} onChange={handleChange} required /></td></tr>
                        <tr><td>Registration End Date:</td><td><input type="date" name="reg_end_date" value={formData.reg_end_date} onChange={handleChange} required /></td></tr>
                        <tr><td>Capacity:</td><td><input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required /></td></tr>
                        <tr><td>Price:</td><td><input type="number" name="price" value={formData.price} onChange={handleChange} required /></td></tr>
                    </tbody></table>
                    <button type="submit">Next</button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmitImages} className="host-form">
                    <h2>Edit Images</h2>
                    <label>Cover Image:</label>
                    <input type="file" onChange={handleCoverImageChange} />
                    {previewCover && <div className="cover-image-preview">
                        <img src={previewCover} alt="cover" />
                        <button type="button" onClick={handleRemoveCoverImage}>✖</button>
                    </div>}

                    <label>Existing Additional Images:</label>
                    <div className="image-previews">
                        {existingImages.map((src, i) => (
                            <div key={i} className="image-preview">
                                <img src={`http://localhost:5173/${src}`} alt={`existing-${i}`} />
                            </div>
                        ))}
                    </div>

                    <label>Add More Images:</label>
                    <input type="file" multiple onChange={handleImageChange} />
                    <div className="image-previews">
                        {selectedImages.map((img, i) => (
                            <div key={i} className="image-preview">
                                <img src={`http://localhost:5173/${src}`} alt={`existing-${i}`} />
                                <button onClick={() => handleRemoveImage(i)}>✖</button>
                            </div>
                        ))}
                    </div>
                    <button type="submit">Next</button>
                </form>
            )}

            {step === 4 && (
                <form onSubmit={handleSubmitCustomFields} className="host-form">
                    <h2>Edit Registration Form Fields</h2>
                    <table><tbody>
                        {customFields.map((field, i) => (
                            <tr key={i}>
                                <td>{field.name} ({field.type})</td>
                                <td><button type="button" onClick={() => handleRemoveField(i)}>✖</button></td>
                            </tr>
                        ))}
                    </tbody></table>
                    <div>
                        <input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Field name" />
                        <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="date">Date</option>
                        </select>
                        <button type="button" onClick={handleAddField}>Add</button>
                    </div>
                    <button type="submit">Finish</button>
                </form>
            )}

            {step === 5 && (
                <div className="host-form success">
                    <h2>Successfully Updated! ✅</h2>
                    <p>Your event changes have been saved.</p>
                    <button onClick={() => navigate("/organizer/home")}>Go Home</button>
                </div>
            )}
        </div>
    )
}

export default EditEvent
