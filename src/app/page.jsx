"use client"

import CharacteristicsSection from "@/components/home/CharacteristicsSection";
import HomeHero from "@/components/home/HomeHero";
import ServicesSection from "@/components/home/ServiceSection";
import { useState, useEffect } from "react";

const Home = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("services");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero Section */}
      <HomeHero />

      {/* Caracteristiques */}
      <CharacteristicsSection />

      {/* Section Recrutement */}
      {/* <RecruitsSection /> */}

      {/* Section CV FIBEM */}
      <ServicesSection />
    </div>
  );
};

export default Home;
