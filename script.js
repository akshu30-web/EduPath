"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 1. HELPER FUNCTIONS
    // =========================

    const $ = (selector) => document.querySelector(selector);

    const $$ = (selector) => document.querySelectorAll(selector);

    const courseCards = Array.from($$(".course-card"));

    const courseSearch = $("#courseSearch");
    const categoryFilter = $("#categoryFilter");
    const courseCount = $("#courseCount");
    const savedCount = $("#savedCount");
    const savedFilter = $("#savedFilter");
    const emptyState = $("#emptyState");
    const resetSearch = $("#resetSearch");

    let showSavedOnly = false;

    const STORAGE_KEY = "edupath_saved_courses";

    function loadSavedCourses() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (!Array.isArray(saved)) {
                return new Set();
            }

            return new Set(
                saved.filter(
                    (id) => Number.isInteger(id)
                )
            );

        } catch (error) {
            return new Set();
        }
    }

    let savedCourses = loadSavedCourses();

    function persistSavedCourses() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Array.from(savedCourses))
            );
        } catch (error) {
            // The website still works if browser storage is unavailable.
        }
    }


    // =========================
    // 2. MOBILE NAVIGATION
    // =========================

    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });
        });
    }


    // =========================
    // 3. COURSE SAVED STATUS
    // =========================

    function updateSavedButtons() {

        courseCards.forEach((card) => {

            const id = Number(card.dataset.id);

            const button = card.querySelector("[data-save]");

            const isSaved = savedCourses.has(id);

            card.dataset.saved = String(isSaved);

            if (button) {

                button.classList.toggle("is-saved", isSaved);

                button.textContent = isSaved ? "★" : "☆";

                button.setAttribute(
                    "aria-pressed",
                    String(isSaved)
                );

                button.setAttribute(
                    "aria-label",
                    `${isSaved ? "Remove" : "Save"} ${card.dataset.name}`
                );
            }
        });

        if (savedCount) {
            savedCount.textContent = savedCourses.size;
        }
    }


    // =========================
    // 4. COURSE SEARCH & FILTER
    // =========================

    function filterCourses() {

        const keyword = courseSearch.value
            .trim()
            .toLowerCase();

        const category = categoryFilter.value;

        let visibleCount = 0;

        courseCards.forEach((card) => {

            const searchableText = (
                card.dataset.search || ""
            ).toLowerCase();

            const matchesSearch = searchableText.includes(keyword);

            const matchesCategory = (
                category === "all" ||
                card.dataset.category === category
            );

            const id = Number(card.dataset.id);

            const matchesSaved = (
                !showSavedOnly ||
                savedCourses.has(id)
            );

            const visible = (
                matchesSearch &&
                matchesCategory &&
                matchesSaved
            );

            card.hidden = !visible;

            if (visible) {
                visibleCount += 1;
            }
        });

        courseCount.textContent = visibleCount;

        emptyState.hidden = visibleCount !== 0;
    }


    courseSearch.addEventListener("input", filterCourses);

    categoryFilter.addEventListener("change", filterCourses);


    savedFilter.addEventListener("click", () => {

        showSavedOnly = !showSavedOnly;

        savedFilter.classList.toggle("is-active", showSavedOnly);

        savedFilter.setAttribute(
            "aria-pressed",
            String(showSavedOnly)
        );

        savedFilter.innerHTML = showSavedOnly
            ? '★ Showing saved (<span id="savedCount">0</span>)'
            : '☆ Saved (<span id="savedCount">0</span>)';

        updateSavedButtons();

        filterCourses();
    });


    resetSearch.addEventListener("click", () => {

        courseSearch.value = "";

        categoryFilter.value = "all";

        showSavedOnly = false;

        savedFilter.classList.remove("is-active");

        savedFilter.setAttribute("aria-pressed", "false");

        savedFilter.innerHTML =
            '☆ Saved (<span id="savedCount">0</span>)';

        updateSavedButtons();

        filterCourses();
    });


    // =========================
    // 5. SAVE OR UNSAVE COURSE
    // =========================

    $$("[data-save]").forEach((button) => {

        button.addEventListener("click", () => {

            const id = Number(button.dataset.save);

            if (savedCourses.has(id)) {

                savedCourses.delete(id);

            } else {

                savedCourses.add(id);
            }

            persistSavedCourses();

            updateSavedButtons();

            filterCourses();
        });
    });


    // =========================
    // 6. COURSE DETAILS DIALOG
    // =========================

    const courseDialog = $("#courseDialog");
    const dialogContent = $("#dialogContent");
    const closeDialog = $("#closeDialog");

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, (character) => {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }


    $$("[data-details]").forEach((button) => {

        button.addEventListener("click", () => {

            const card = button.closest(".course-card");

            if (!card) {
                return;
            }

            const id = Number(card.dataset.id);

            const courseName = card.dataset.name;

            const description = card.querySelector(
                ".course-description"
            ).textContent.trim();

            const meta = Array.from(
                card.querySelectorAll(".course-meta span")
            ).map((element) => element.textContent.trim());

            const duration = card.querySelector(
                ".course-card-footer > span"
            ).textContent.trim();

            const skillText = card.dataset.search || "";

            const skills = skillText
                .split(" ")
                .filter(Boolean);

            dialogContent.innerHTML = `
                <h2 class="dialog-title">
                    ${escapeHTML(courseName)}
                </h2>

                <p class="dialog-description">
                    ${escapeHTML(description)}
                </p>

                <div class="dialog-meta">
                    ${meta.map((item) => `
                        <span>${escapeHTML(item)}</span>
                    `).join("")}

                    <span>${escapeHTML(duration)}</span>
                </div>

                <h3 class="dialog-subheading">
                    Topics to explore
                </h3>

                <div class="dialog-skills">
                    ${skills.map((skill) => `
                        <span>${escapeHTML(skill)}</span>
                    `).join("")}
                </div>

                <button type="button"
                        class="btn btn-primary full-width"
                        id="dialogSaveButton"
                        style="margin-top: 24px;">
                    ${savedCourses.has(id)
                        ? "★ Remove from Saved"
                        : "☆ Save This Course"}
                </button>
            `;

            const dialogSaveButton = $("#dialogSaveButton");

            dialogSaveButton.addEventListener("click", () => {

                if (savedCourses.has(id)) {

                    savedCourses.delete(id);

                } else {

                    savedCourses.add(id);
                }

                persistSavedCourses();

                updateSavedButtons();

                filterCourses();

                dialogSaveButton.textContent = savedCourses.has(id)
                    ? "★ Remove from Saved"
                    : "☆ Save This Course";
            });

            if (typeof courseDialog.showModal === "function") {

                courseDialog.showModal();

            } else {

                alert(
                    `${courseName}\n\n${description}`
                );
            }
        });
    });


    closeDialog.addEventListener("click", () => {

        courseDialog.close();
    });


    courseDialog.addEventListener("click", (event) => {

        if (event.target === courseDialog) {
            courseDialog.close();
        }
    });


    // =========================
    // 7. SMART COURSE FINDER
    // =========================

    const finderForm = $("#finderForm");
    const finderResult = $("#finderResult");

    finderForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const interest = $("#interest").value;

        const experience = $("#experience").value;

        const goal = $("#goal").value;

        if (!interest || !experience || !goal) {

            finderResult.hidden = false;

            finderResult.textContent =
                "Please answer all three questions.";

            return;
        }

        const matchingCourses = courseCards.filter((card) => {

            const categoryMatch = (
                card.dataset.category === interest
            );

            const searchMatch = (
                interest === "AI & Data" &&
                /Artificial Intelligence|Data Science|Machine Learning/i
                    .test(card.dataset.name)
            );

            return categoryMatch || searchMatch;
        });

        let recommendation;

        if (matchingCourses.length > 0) {

            if (
                experience === "Intermediate" &&
                interest === "AI & Data"
            ) {

                recommendation = matchingCourses.find((card) =>
                    /Machine Learning/i.test(card.dataset.name)
                ) || matchingCourses[0];

            } else if (
                interest === "Programming"
            ) {

                recommendation = matchingCourses.find((card) =>
                    /Python/i.test(card.dataset.name)
                ) || matchingCourses[0];

            } else if (
                interest === "Web Development"
            ) {

                recommendation = matchingCourses.find((card) =>
                    /Web Development/i.test(card.dataset.name)
                ) || matchingCourses[0];

            } else {

                recommendation = matchingCourses[0];
            }

        } else {

            recommendation = courseCards[0];
        }

        const name = recommendation.dataset.name;

        const goalMessage = {
            career: "Use this course as a starting point for career exploration.",
            projects: "Practise the concepts by building a small project.",
            explore: "Start with the fundamentals and discover what interests you."
        };

        finderResult.innerHTML = `
            <h3>Your suggested starting course</h3>

            <p>
                <strong>${escapeHTML(name)}</strong>
            </p>

            <p>
                ${escapeHTML(goalMessage[goal])}
            </p>

            <a href="#courses" id="recommendedCourseLink">
                Explore this course →
            </a>
        `;

        finderResult.hidden = false;

        const recommendedCourseLink = $("#recommendedCourseLink");

        recommendedCourseLink.addEventListener("click", () => {

            courseSearch.value = name;

            categoryFilter.value = "all";

            showSavedOnly = false;

            savedFilter.classList.remove("is-active");

            savedFilter.innerHTML =
                '☆ Saved (<span id="savedCount">0</span>)';

            filterCourses();
        });
    });


    // =========================
    // 8. CONTACT FORM
    // =========================

    const contactForm = $("#contactForm");

    const contactStatus = $("#contactStatus");

    const contactSubmit = $("#contactSubmit");

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        contactStatus.hidden = true;

        contactStatus.classList.remove("error");

        contactSubmit.disabled = true;

        contactSubmit.textContent = "Submitting...";

        const formData = new FormData(contactForm);

        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message")
        };

        try {

            const response = await fetch("/api/contact", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            });

            const result = await response.json();

            contactStatus.textContent = result.message;

            contactStatus.hidden = false;

            if (!response.ok || !result.success) {

                contactStatus.classList.add("error");

            } else {

                contactForm.reset();
            }

        } catch (error) {

            contactStatus.textContent =
                "Unable to connect. Please run the website using Flask and try again.";

            contactStatus.hidden = false;

            contactStatus.classList.add("error");

        } finally {

            contactSubmit.disabled = false;

            contactSubmit.textContent = "Submit Enquiry →";
        }
    });


    // =========================
    // 9. INITIALISE WEBSITE
    // =========================

    updateSavedButtons();

    filterCourses();

});