import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage = 'https://jamupettransit.com/cars.jpg',
  ogType = 'website',
  twitterHandle = '@JamupetTransit'
}) {
  const siteName = "Jamupet Transit";
  
  let htmlTitle = siteName;
  let ogTitle = siteName;
  
  if (title) {
    // og:title allows 60-90 chars
    ogTitle = title.length <= 90 ? title : title.substring(0, 90);
    
    // HTML title is strict 60 max
    if (title.includes(siteName)) {
      htmlTitle = title.substring(0, 60);
    } else if (title.length + siteName.length + 3 <= 60) {
      htmlTitle = `${title} | ${siteName}`;
    } else {
      htmlTitle = title.substring(0, 60);
    }
  }

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{htmlTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      
      {/* Twitter Card tags */}
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
