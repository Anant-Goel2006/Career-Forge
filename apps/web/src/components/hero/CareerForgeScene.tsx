"use client";

import React, { useEffect, useRef } from "react";

export function CareerForgeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 500;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    };

    window.addEventListener("resize", handleResize);

    // Particles setup
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25 - 0.1,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    // Floating Space Rocks / Asteroids
    const rocks = [
      { x: 0.18, y: 0.35, size: 22, rotation: 0.4, rotSpeed: 0.003, floatOffset: 0 },
      { x: 0.82, y: 0.28, size: 18, rotation: 1.2, rotSpeed: -0.002, floatOffset: 1.5 },
      { x: 0.88, y: 0.45, size: 14, rotation: 0.8, rotSpeed: 0.004, floatOffset: 3 },
      { x: 0.14, y: 0.52, size: 16, rotation: 2.1, rotSpeed: -0.003, floatOffset: 2.2 },
    ];

    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 20;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 20;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      if (!prefersReducedMotion) {
        time += 0.018;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5 + mouseX * 0.5;
      const centerY = height * 0.48 + mouseY * 0.5;

      // 1. Deep Space Atmospheric Glow
      const bgGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        width * 0.55
      );
      bgGlow.addColorStop(0, "rgba(139, 92, 246, 0.18)");
      bgGlow.addColorStop(0.45, "rgba(76, 29, 149, 0.08)");
      bgGlow.addColorStop(0.8, "rgba(5, 5, 5, 0.0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Distant Glowing Circular Halo Ring
      const haloRadius = Math.min(width, height) * 0.38;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, haloRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(167, 139, 250, 0.45)";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(139, 92, 246, 0.8)";
      ctx.shadowBlur = 35;
      ctx.stroke();

      // Outer delicate neon rim
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, haloRadius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // 3. Floating Particles / Cosmic Dust
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        const currentAlpha = p.alpha + Math.sin(time * 3 + p.x) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 180, 254, ${Math.max(0.1, currentAlpha)})`;
        ctx.shadowColor = "rgba(167, 139, 250, 0.6)";
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      // 4. Floating Asteroid Rocks
      rocks.forEach((rock) => {
        const rx = width * rock.x + Math.sin(time + rock.floatOffset) * 6;
        const ry = height * rock.y + Math.cos(time * 0.8 + rock.floatOffset) * 8;
        const rot = rock.rotation + (prefersReducedMotion ? 0 : time * rock.rotSpeed * 20);

        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(rot);

        ctx.fillStyle = "#121216";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-rock.size, -rock.size * 0.6);
        ctx.lineTo(-rock.size * 0.3, -rock.size);
        ctx.lineTo(rock.size * 0.7, -rock.size * 0.8);
        ctx.lineTo(rock.size, 0);
        ctx.lineTo(rock.size * 0.5, rock.size * 0.9);
        ctx.lineTo(-rock.size * 0.6, rock.size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Edge specular light
        ctx.beginPath();
        ctx.moveTo(-rock.size * 0.3, -rock.size);
        ctx.lineTo(rock.size * 0.7, -rock.size * 0.8);
        ctx.strokeStyle = "rgba(196, 181, 253, 0.4)";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.restore();
      });

      // 5. Cylindrical Futuristic Pedestal Platform (Bottom)
      const platformY = centerY + 95;
      const platformWidth = Math.min(width * 0.68, 300);
      const platformHeight = 24;

      ctx.save();
      // Outer base shadow / glow
      ctx.shadowColor = "rgba(139, 92, 246, 0.5)";
      ctx.shadowBlur = 40;

      // Platform disc top
      const platformGrad = ctx.createLinearGradient(
        centerX - platformWidth / 2,
        platformY,
        centerX + platformWidth / 2,
        platformY
      );
      platformGrad.addColorStop(0, "rgba(20, 20, 26, 0.95)");
      platformGrad.addColorStop(0.5, "rgba(35, 30, 48, 0.95)");
      platformGrad.addColorStop(1, "rgba(20, 20, 26, 0.95)");

      ctx.beginPath();
      ctx.ellipse(centerX, platformY, platformWidth / 2, platformHeight, 0, 0, Math.PI * 2);
      ctx.fillStyle = platformGrad;
      ctx.fill();

      // Glowing circular neon rims on platform
      ctx.strokeStyle = "rgba(167, 139, 250, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glowing ring on platform
      ctx.beginPath();
      ctx.ellipse(centerX, platformY, (platformWidth / 2) * 0.75, platformHeight * 0.75, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // 6. Floating Faceted 3D Crystal Prism (CareerForge Logo Mark)
      const floatY = Math.sin(time * 1.5) * 10;
      const crystalY = centerY - 15 + floatY;
      const crystalH = 110;
      const crystalW = 80;

      ctx.save();
      ctx.shadowColor = "rgba(167, 139, 250, 0.6)";
      ctx.shadowBlur = 45;

      // Crystal Facets coordinates
      const topP = { x: centerX, y: crystalY - crystalH * 0.5 };
      const bottomP = { x: centerX, y: crystalY + crystalH * 0.5 };
      const leftP = { x: centerX - crystalW * 0.5, y: crystalY };
      const rightP = { x: centerX + crystalW * 0.5, y: crystalY };
      const centerP = { x: centerX, y: crystalY };

      // Top Left Facet
      const gradTL = ctx.createLinearGradient(topP.x, topP.y, leftP.x, leftP.y);
      gradTL.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      gradTL.addColorStop(1, "rgba(139, 92, 246, 0.6)");
      ctx.fillStyle = gradTL;
      ctx.beginPath();
      ctx.moveTo(topP.x, topP.y);
      ctx.lineTo(leftP.x, leftP.y);
      ctx.lineTo(centerP.x, centerP.y);
      ctx.closePath();
      ctx.fill();

      // Top Right Facet
      const gradTR = ctx.createLinearGradient(topP.x, topP.y, rightP.x, rightP.y);
      gradTR.addColorStop(0, "rgba(244, 244, 245, 0.95)");
      gradTR.addColorStop(1, "rgba(76, 29, 149, 0.7)");
      ctx.fillStyle = gradTR;
      ctx.beginPath();
      ctx.moveTo(topP.x, topP.y);
      ctx.lineTo(rightP.x, rightP.y);
      ctx.lineTo(centerP.x, centerP.y);
      ctx.closePath();
      ctx.fill();

      // Bottom Left Facet
      const gradBL = ctx.createLinearGradient(bottomP.x, bottomP.y, leftP.x, leftP.y);
      gradBL.addColorStop(0, "rgba(167, 139, 250, 0.75)");
      gradBL.addColorStop(1, "rgba(30, 27, 75, 0.85)");
      ctx.fillStyle = gradBL;
      ctx.beginPath();
      ctx.moveTo(bottomP.x, bottomP.y);
      ctx.lineTo(leftP.x, leftP.y);
      ctx.lineTo(centerP.x, centerP.y);
      ctx.closePath();
      ctx.fill();

      // Bottom Right Facet
      const gradBR = ctx.createLinearGradient(bottomP.x, bottomP.y, rightP.x, rightP.y);
      gradBR.addColorStop(0, "rgba(196, 181, 253, 0.8)");
      gradBR.addColorStop(1, "rgba(15, 10, 30, 0.9)");
      ctx.fillStyle = gradBR;
      ctx.beginPath();
      ctx.moveTo(bottomP.x, bottomP.y);
      ctx.lineTo(rightP.x, rightP.y);
      ctx.lineTo(centerP.x, centerP.y);
      ctx.closePath();
      ctx.fill();

      // Sharp Crisp Specular Ridges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(topP.x, topP.y);
      ctx.lineTo(bottomP.x, bottomP.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftP.x, leftP.y);
      ctx.lineTo(rightP.x, rightP.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Outer outline
      ctx.beginPath();
      ctx.moveTo(topP.x, topP.y);
      ctx.lineTo(rightP.x, rightP.y);
      ctx.lineTo(bottomP.x, bottomP.y);
      ctx.lineTo(leftP.x, leftP.y);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dynamic light refraction glare
      const glareGrad = ctx.createRadialGradient(
        topP.x + 5,
        topP.y + 20,
        0,
        topP.x + 5,
        topP.y + 20,
        25
      );
      glareGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      glareGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glareGrad;
      ctx.beginPath();
      ctx.arc(topP.x + 5, topP.y + 20, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative h-full w-full select-none overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
