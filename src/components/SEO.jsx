import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage = '/jts-logoo.png',
  ogType = 'website',
  twitterHandle = '@JamupetTransit'
}) {
  const siteName = "Jamupet Transit";
  
  // Ensure title is under 60 chars as requested
  const formattedTitle = title ? `${title.substring(0, 50)} | ${siteName}` : siteName;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      
      {/* Twitter Card tags */}
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
