import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Host.css"

function Host() {

    const [step, setStep] = useState(1)
    const [organizerId, setOrganizerId] = useState(null)
    const [eventId, setEventId] = useState(null)
    const [selectedImages, setSelectedImages] = useState([])
    const [customFields, setCustomFields] = useState([
        { name: "Name", type: "text" },
        { name: "Email", type: "email" }
    ])
    const [newFieldName, setNewFieldName] = useState("")
    const [newFieldType, setNewFieldType] = useState("text")
    const [coverImage, setCoverImage] = useState(null)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        capacity: "",
        organiser: "",
        reg_start_date: "",
        reg_end_date: "",
        price: "",
        categories: []
    })

    const categoriesList = [
        "Academics", "Culture", "Sports", "Social", "Tech", "Career",
        "Awareness", "Festivals", "Community", "Competitions", "Workshops",
        "Events", "InterCollege", "Clubs"
    ]

    useEffect(() => {
        const storedOrganizerId = localStorage.getItem("userId");
        if (storedOrganizerId) {
            setOrganizerId(storedOrganizerId);
            setFormData(prev => ({ ...prev, organiser: storedOrganizerId }));
        } else {
            console.warn("User is not an organizer or ID is missing!")
        }
    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target
        setFormData(prev => {
            const updatedCategories = checked
                ? [...prev.categories, value]
                : prev.categories.filter(c => c !== value)
            return { ...prev, categories: updatedCategories }
        })
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setSelectedImages(prevImages => [
            ...prevImages,
            ...files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }))
        ])
    }

    const handleSubmitBasic = async (e) => {
        e.preventDefault()
        if (formData.categories.length === 0) {
            alert("Please select at least one category.")
            return
        }

        const response = await fetch("http://localhost:3000/events/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                venue: formData.venue,
                organiser: formData.organiser,
                categories: formData.categories
            })
        })

        const result = await response.json()
        if (response.ok) {
            alert("Basic details submitted! Now enter additional details.")
            setEventId(result.event_id)
            setStep(2)
        } else {
            alert("Error: " + result.error)
        }
    }

    const handleSubmitExtra = async (e) => {
        e.preventDefault()
        if (!eventId) {
            alert("Event ID missing!")
            return
        }

        if (!formData.capacity || !formData.reg_start_date || !formData.reg_end_date || !formData.price) {
            alert("All fields are required in Step 2!")
            return
        }

        const response = await fetch("http://localhost:3000/events/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event_id: eventId,
                reg_start_date: formData.reg_start_date,
                reg_end_date: formData.reg_end_date,
                price: formData.price,
                capacity: formData.capacity
            })
        })

        const result = await response.json()
        if (response.ok) {
            alert("Additional details submitted! Now upload event images.")
            setStep(3)
        } else {
            alert("Error: " + result.error)
        }
    }

    const handleSubmitImages = async (e) => {
        e.preventDefault()
        if (!eventId || !selectedImages.length || !coverImage) {
            alert("Please select a cover image and at least one event image.")
            return
        }

        const imageData = new FormData()
        imageData.append("event_id", eventId)
        imageData.append("cover_image", coverImage.file)
        for (let i = 0; i < selectedImages.length; i++) {
            imageData.append("images", selectedImages[i].file)
        }

        const response = await fetch("http://localhost:3000/events/upload-pics", {
            method: "POST",
            body: imageData
        })

        const result = await response.json()
        if (response.ok) {
            setStep(4)
        } else {
            alert("Error: " + result.error)
        }
    }

    const handleRemoveImage = (index) => {
        setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index))
    }

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setCoverImage({
                file,
                preview: URL.createObjectURL(file)
            })
        }
    }

    const handleRemoveCoverImage = () => {
        setCoverImage(null)
    }

    const handleAddField = () => {
        if (!newFieldName.trim()) return
        const exists = customFields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase())
        if (exists) {
            alert("Field with this name already exists.")
            return
        }
        setCustomFields(prev => [...prev, { name: newFieldName.trim(), type: newFieldType }])
        setNewFieldName("")
        setNewFieldType("text")
    }

    const handleRemoveField = (index) => {
        setCustomFields(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmitCustomFields = async (e) => {
        e.preventDefault()
        const response = await fetch("http://localhost:3000/events/custom-fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: eventId, fields: customFields })
        })

        const result = await response.json()
        if (response.ok) {
            setStep(5)
        } else {
            alert("Error: " + result.error)
        }
    }

    return (
        <div className="host Main">
            <div className="sections">
                <h3 className={step === 1 ? "active current" : step > 1 ? "active completed" : "inactive"}>Add Details</h3>
                <h3 className={step === 2 ? "active current" : step > 2 ? "active completed" : "inactive"}>Add Extra Details</h3>
                <h3 className={step === 3 ? "active current" : step > 3 ? "active completed" : "inactive"}>Upload Pictures</h3>
                <h3 className={step === 4 ? "active current" : step > 4 ? "active completed" : "inactive"}>Create Form</h3>
            </div>

           {step === 1 && (
  <form onSubmit={handleSubmitBasic} className="host-form">
    <h2 className="head-text">Enter the Details:</h2>

    {/* Event Title Row */}
    <table><tbody>
      <tr>
        <td>Event Title:</td>
        <td>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </td>
      </tr>
    </tbody></table>

    {/* Date and Time in One Row */}
<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
  {/* Date & Time Row */}
  <div style={{ display: 'flex', width: '100%', marginTop: '10px', paddingLeft: '50px' }}>
    {/* Date Section */}
    <div style={{ width: '50%', display: 'flex', alignItems: 'center' }}>
      <label style={{ fontWeight: 'bold', marginRight: '105px', whiteSpace: 'nowrap' }}>Date:</label>
      <input 
        type="date" 
        name="date" 
        value={formData.date} 
        onChange={handleChange} 
        required 
        style={{ flex: 1 }} 
      />
    </div>

    {/* Time Section */}
    <div style={{ width: '45.5%', display: 'flex', alignItems: 'center', paddingLeft: '43px' }}>
      <label style={{ fontWeight: 'bold', marginRight: '10px', whiteSpace: 'nowrap' }}>Time:</label>
      <input 
        type="time" 
        name="time" 
        value={formData.time} 
        onChange={handleChange} 
        required 
        style={{ flex: 1 }} 
      />
    </div>
  </div>
</div>


    {/* Description, Venue, Category */}
    <table><tbody>
        <tr>
        <td>Venue:</td>
        <td colSpan="3">
          <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
        </td>
      </tr>
      <tr>
        <td>Description:</td>
        <td colSpan="3">
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </td>
      </tr>
      <tr>
        <td>Category:</td>
        <td colSpan="3">
          <div className="categories">
            {categoriesList.map((category, index) => (
              <div key={index} className="each-category">
                <input
                  type="checkbox"
                  id={`cat-${index}`}
                  value={category}
                  className="check"
                  checked={formData.categories.includes(category)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={`cat-${index}`}>{category}</label>
              </div>
            ))}
          </div>
        </td>
      </tr>
    </tbody></table>

    <button type="submit">Next</button>
  </form>
)}


            {step === 2 && (
                <form onSubmit={handleSubmitExtra} className="host-form">
                    <h2 className="head-text">Enter Additional Details:</h2>
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
                    <h2 className="head-text">Upload Event Pictures:</h2>
                    <label>Upload Cover Image:</label>
                    <input type="file" onChange={handleCoverImageChange} required />
                    {coverImage && (
                        <div className="cover-image-preview">
                            <img src={coverImage.preview} alt="cover preview" />
                            <button className="remove-btn" onClick={handleRemoveCoverImage}>✖</button>
                        </div>
                    )}
                    <label>Upload Additional Event Images:</label>
                    <input type="file" multiple onChange={handleImageChange} required />
                    <div className="image-previews">
                        {selectedImages.length > 0 ? selectedImages.map((img, index) => (
                            <div key={index} className="image-preview">
                                <img src={img.preview} alt={`preview-${index}`} />
                                <button className="remove-btn" onClick={() => handleRemoveImage(index)}>✖</button>
                            </div>
                        )) : <p>No images selected</p>}
                    </div>
                    <button type="submit">Finish</button>
                </form>
            )}

            {step === 4 && (
                <form onSubmit={handleSubmitCustomFields} className="host-form">
                    <h2 className="head-text">Add Custom Fields for Registration:</h2>
                    <table className="custom-field-table"><tbody>
                        {customFields.map((field, index) => (
                            <tr key={index}>
                                <td>{field.name} ({field.type})</td>
                                <td>
                                    <button type="button" className="remove-field-btn" onClick={() => handleRemoveField(index)}
                                        disabled={field.name === "Name" || field.name === "Email"}>✖</button>
                                </td>
                            </tr>
                        ))}
                    </tbody></table>
                    <div className="add-field-container">
                        <input type="text" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Field name" />
                        <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="date">Date</option>
                        </select>
                        <button type="button" onClick={handleAddField}>Add Field</button>
                    </div>
                    <button type="submit">Finish</button>
                </form>
            )}

            {step === 5 && (
                <div className="host-form success">
                    <h2 className="head-text">Successfully Created! 🎉</h2>
                    <p>Your event has been successfully created and is now awaiting admin approval.</p>
                    <button onClick={() => navigate("/organizer/home")}>Continue</button>
                </div>
            )}
        </div>
    )
}

export default Host
