from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

COURSES = [
    {
        "id": 1,
        "name": "Python Programming",
        "category": "Programming",
        "level": "Beginner",
        "duration": "6 weeks",
        "description": "Learn Python fundamentals, variables, loops, functions and problem-solving.",
        "icon": "PY",
        "color": "purple",
        "skills": ["Python", "Logic", "Problem Solving"],
        "career": "Python Developer"
    },
    {
        "id": 2,
        "name": "Artificial Intelligence",
        "category": "AI & Data",
        "level": "Beginner",
        "duration": "8 weeks",
        "description": "Explore AI concepts, intelligent systems and real-world applications.",
        "icon": "AI",
        "color": "blue",
        "skills": ["AI Basics", "Algorithms", "Critical Thinking"],
        "career": "AI Engineer"
    },
    {
        "id": 3,
        "name": "Data Science",
        "category": "AI & Data",
        "level": "Beginner",
        "duration": "8 weeks",
        "description": "Understand data analysis, visualisation and introductory statistics.",
        "icon": "DS",
        "color": "green",
        "skills": ["Data Analysis", "Statistics", "Visualisation"],
        "career": "Data Analyst"
    },
    {
        "id": 4,
        "name": "Web Development",
        "category": "Web Development",
        "level": "Beginner",
        "duration": "6 weeks",
        "description": "Build responsive websites using HTML, CSS and JavaScript.",
        "icon": "WD",
        "color": "orange",
        "skills": ["HTML", "CSS", "JavaScript"],
        "career": "Web Developer"
    },
    {
        "id": 5,
        "name": "SQL and Databases",
        "category": "Programming",
        "level": "Beginner",
        "duration": "4 weeks",
        "description": "Learn to store, organise and retrieve information using SQL.",
        "icon": "DB",
        "color": "pink",
        "skills": ["SQL", "Database Design", "Queries"],
        "career": "Database Developer"
    },
    {
        "id": 6,
        "name": "Machine Learning",
        "category": "AI & Data",
        "level": "Intermediate",
        "duration": "10 weeks",
        "description": "Discover how computers learn patterns from data.",
        "icon": "ML",
        "color": "teal",
        "skills": ["Python", "Statistics", "Machine Learning"],
        "career": "Machine Learning Engineer"
    }
]


@app.route("/")
def home():
    return render_template("index.html", courses=COURSES)


@app.route("/api/courses")
def get_courses():
    return jsonify(COURSES)


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    message = str(data.get("message", "")).strip()

    if not name or not email or not message:
        return jsonify({
            "success": False,
            "message": "Please complete all the fields."
        }), 400

    if len(name) > 100 or len(email) > 254 or len(message) > 2000:
        return jsonify({
            "success": False,
            "message": "Please shorten your submitted information."
        }), 400

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    # Demo mode: the message is validated but is not emailed or stored.
    return jsonify({
        "success": True,
        "message": (
            "Thank you! Your form passed validation. "
            "Email delivery is not configured in this demo."
        )
    })


@app.errorhandler(404)
def page_not_found(error):
    return "Page not found.", 404


if __name__ == "__main__":
    app.run(debug=True)