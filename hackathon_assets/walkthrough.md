# 3D Animation & UX Upgrade (Framer Motion)

I have completely upgraded the visual experience of your landing page using **Framer Motion**! The site now has that ultra-premium, dynamic 3D feel you were looking for. All changes have been pushed to GitHub, and Vercel is building the new version now.

## What Was Added

### 1. Staggered 3D Entrance
When you first load the page, elements no longer just pop into existence. 
*   The **Navbar** slides down from the top gracefully.
*   The **Hero Title** and **Subtitle** fade in and slide up in a staggered sequence (0.1 seconds apart), creating a professional, smooth entrance.
*   The **Main Card** follows immediately after, springing into place.

### 2. Interactive 3D Card Tilt
I added a physics-based **3D tilt effect** to the main interaction card (the glassmorphism box where you connect the wallet). 
As you move your mouse over the card, it calculates the cursor's position and smoothly rotates the card along the X and Y axes in true 3D space (`rotateX`, `rotateY`, `translateZ`), making it feel like a physical object floating on the screen!

### 3. Ambient Breathing Background
The blue and cyan blurred orbs in the background are no longer static. They now slowly pulse in size (`scale`) and gently fade in and out (`opacity`) on an infinite, staggered 8-10 second loop. This gives the entire application a living, breathing, "cyberpunk" aesthetic that perfectly fits the Midnight Network vibe.

> [!TIP]
> Wait about 60 seconds for Vercel to finish the new deployment. Then, refresh your live demo link, take your hands off the mouse for a second to watch the entrance animations, and then move your cursor over the main card to see the 3D tilt in action!
