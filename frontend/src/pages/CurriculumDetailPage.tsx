import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Curriculum } from '../types';
import RatingDisplay from '../components/curriculum/RatingDisplay';
import { SaveCurriculumButton } from '../components/curriculum/SaveCurriculumButton';
import SEO from '../components/SEO';
import LazyImage from '../components/LazyImage';

const CurriculumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Curriculum ID not provided');
      setLoading(false);
      return;
    }

    const fetchCurriculum = async () => {
      try {
        const response = await api.getCurriculumById(id);
        setCurriculum(response.data.curriculum || response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load curriculum');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [id]);



  const renderPriceRange = (priceRange: string) => {
    const symbols = {
      '$': '$0 - $50',
      '$$': '$50 - $150', 
      '$$$': '$150 - $300',
      '$$$$': '$300+'
    };
    return symbols[priceRange as keyof typeof symbols] || priceRange;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !curriculum) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Curriculum not found'}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate SEO data
  const seoTitle = `${curriculum.name} Review - ${curriculum.publisher}`;
  const seoDescription = `Detailed review of ${curriculum.name} by ${curriculum.publisher}. Rating: ${curriculum.overallRating}/5. ${curriculum.description.substring(0, 120)}...`;
  const seoUrl = `https://shelftaught.com/curriculum/${curriculum.id}`;
  const seoKeywords = `${curriculum.name}, ${curriculum.publisher}, homeschool curriculum, ${curriculum.subjectsCovered.subjects.join(', ')}, ${curriculum.targetAgeGrade.gradeRange}`;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": curriculum.name,
    "description": curriculum.description,
    "brand": {
      "@type": "Brand",
      "name": curriculum.publisher
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": curriculum.overallRating,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": curriculum.reviewCount
    },
    "offers": {
      "@type": "Offer",
      "priceRange": curriculum.cost.priceRange,
      "availability": curriculum.availability.inPrint ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "category": "Educational Material",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "typicalAgeRange": `${curriculum.targetAgeGrade.minAge}-${curriculum.targetAgeGrade.maxAge}`
    }
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={seoUrl}
        keywords={seoKeywords}
        image={curriculum.imageUrl}
        type="product"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {curriculum.imageUrl && (
              <div className="w-full md:w-1/3">
                <LazyImage
                  src={curriculum.imageUrl}
                  alt={`${curriculum.name} by ${curriculum.publisher}`}
                  className="w-full h-64 md:h-full"
                  loading="eager"
                />
              </div>
            )}
            <div className={`p-4 sm:p-6 ${curriculum.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {curriculum.name}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mb-4">
                    by {curriculum.publisher}
                  </p>
                </div>
                <SaveCurriculumButton
                  curriculumId={curriculum.id}
                />
              </div>
              
              <div className="mb-4">
                <RatingDisplay
                  rating={curriculum.overallRating}
                  size="lg"
                  label="Overall Rating"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Based on {curriculum.reviewCount} review{curriculum.reviewCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {curriculum.description}
              </p>
            </div>
          </div>
        </div>

        {/* Full Review Section */}
        {curriculum.fullReview && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Detailed Review
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">
                {curriculum.fullReview}
              </p>
            </div>
          </div>
        )}

        {/* Rating Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Target Age/Grade */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Target Age & Grade Level
            </h3>
            <RatingDisplay
              rating={curriculum.targetAgeGrade.rating}
              label="Age Appropriateness"
            />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Age Range:</span> {curriculum.targetAgeGrade.minAge} - {curriculum.targetAgeGrade.maxAge} years
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Grade Range:</span> {curriculum.targetAgeGrade.gradeRange}
              </p>
            </div>
          </div>

          {/* Teaching Approach */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Teaching Approach
            </h3>
            <RatingDisplay
              rating={curriculum.teachingApproach.rating}
              label="Approach Quality"
            />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Style:</span> {curriculum.teachingApproach.style}
              </p>
              <p className="text-sm text-gray-700">
                {curriculum.teachingApproach.description}
              </p>
            </div>
          </div>

          {/* Subjects Covered */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subjects Covered
            </h3>
            <RatingDisplay
              rating={curriculum.subjectsCovered.rating}
              label="Subject Coverage"
            />
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Comprehensiveness:</span> {curriculum.subjectsCovered.comprehensiveness}/5
              </p>
              <div className="flex flex-wrap gap-2">
                {curriculum.subjectsCovered.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Materials Included */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Materials Included
            </h3>
            <RatingDisplay
              rating={curriculum.materialsIncluded.rating}
              label="Material Quality"
            />
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Completeness:</span> {curriculum.materialsIncluded.completeness}/5
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                {curriculum.materialsIncluded.components.map((component, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {component}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instruction Style */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Instruction Style
            </h3>
            <RatingDisplay
              rating={curriculum.instructionStyle.rating}
              label="Instruction Quality"
            />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {curriculum.instructionStyle.type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Support Level:</span> {curriculum.instructionStyle.supportLevel}/5
              </p>
            </div>
          </div>

          {/* Time Commitment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Time Commitment
            </h3>
            <RatingDisplay
              rating={curriculum.timeCommitment.rating}
              label="Time Flexibility"
            />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Daily:</span> {curriculum.timeCommitment.dailyMinutes} minutes
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Weekly:</span> {curriculum.timeCommitment.weeklyHours} hours
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Flexibility:</span> {curriculum.timeCommitment.flexibility}/5
              </p>
            </div>
          </div>
        </div>

        {/* Cost and Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cost
            </h3>
            <RatingDisplay
              rating={curriculum.cost.rating}
              label="Value for Money"
            />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Price Range:</span> {renderPriceRange(curriculum.cost.priceRange)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Value Rating:</span> {curriculum.cost.value}/5
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Availability
            </h3>
            <RatingDisplay
              rating={curriculum.availability.rating}
              label="Availability Score"
            />
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm">
                <span className={`w-3 h-3 rounded-full mr-2 ${curriculum.availability.inPrint ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-gray-600">In Print: {curriculum.availability.inPrint ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`w-3 h-3 rounded-full mr-2 ${curriculum.availability.digitalAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-gray-600">Digital Available: {curriculum.availability.digitalAvailable ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`w-3 h-3 rounded-full mr-2 ${curriculum.availability.usedMarket ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-gray-600">Used Market: {curriculum.availability.usedMarket ? 'Available' : 'Limited'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths, Weaknesses, Best For */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Strengths
            </h3>
            <ul className="space-y-2">
              {curriculum.strengths.map((strength, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-red-700 mb-4">
              Weaknesses
            </h3>
            <ul className="space-y-2">
              {curriculum.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="text-red-500 mr-2 mt-1">×</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              Best For
            </h3>
            <ul className="space-y-2">
              {curriculum.bestFor.map((item, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Results
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default CurriculumDetailPage;