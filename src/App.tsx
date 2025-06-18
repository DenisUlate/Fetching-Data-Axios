import React, { useState, useEffect } from "react";
import { Search, Clock, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API_KEY = "your_api_key_here"; // Replace with your actual API key
const API_URL = "https://api.example.com/data"; // Replace with your actual API URL

const App = () => {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [favorites, setFavorites] = useState([]);
	const [selectedRecipe, setSelectedRecipe] = useState(null);

	// Fetch random recipes on component mount
	useEffect(() => {
		fetchRandomRecipes();
	}, []);

	// Function to fetch random recipes
	const fetchRandomRecipes = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${BASE_URL}/random`, {
				params: {
					apikey: API_KEY,
					number: 6, // Fetch 10 random recipes
				},
			});
			setRecipes(response.data.recipes);
		} catch (error) {
			console.error("Error fetching random recipes:", error);
		} finally {
			setLoading(false);
		}
	};

	// Function to search recipes
	const searchRecipes = async () => {
		if (!searchTerm.trim()) return;

		setLoading(true);
		try {
			const response = await axios.get(`${BASE_URL}/complexSearch`, {
				params: {
					apikey: API_KEY,
					query: searchTerm,
					number: 12, // Fetch 12 recipes based on search term
					addRecipeInformation: true,
				},
			});
			setRecipes(response.data.results);
		} catch (error) {
			console.error("Error searching recipes:", error);
		} finally {
			setLoading(false);
		}
	};

	// Function to handle favorite toggle
	const getRecipeDetails = async (id) => {
		try {
			const response = await axios.get(`${BASE_URL}/${id}/information`, {
				params: {
					apiKey: API_KEY,
				},
			});
			setSelectedRecipe(response.data);
		} catch (error) {
			console.error("Error fetching recipe details:", error);
		}
	};

	// Function to toggle favorite status
	const toggleFavorite = (recipe) => {
		setFavorites((prev) => {
			const isFavorite = prev.find((fav) => fav.id === recipe.id);
			if (isFavorite) {
				return prev.filter((fav) => fav.id !== recipe.id);
			} else {
				return [...prev, recipe];
			}
		});
	};

	// Function to check if a recipe is a favorite
	const isFavorite = (recipeId) => {
		return favorites.some((fav) => fav.id === recipeId);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				{/* HEADER */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800">Recipe Finder</h1>
					<p className="text-gray-600 mt-2">Discover and save your favorite recipes</p>
				</div>

				{/* SEARCH BAR */}
				<div className="max-w-md mx-auto mb-8">
					<div className="flex gap-2">
						<Input
							type="text"
							placeholder="Search for recipes..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyPress={(e) => setSearchTerm(e.target.value)}
							className="flex-1"
						/>
						<Button onClick={searchRecipes} disabled={loading}>
							<Search className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* ACTION BUTTONS */}
				<div className="flex justify-center gap-4 mb-8">
					<Button onClick={fetchRandomRecipes} variant="outline" disabled={loading}>
						Random Recipes
					</Button>
					<Button variant="outline" disabled={favorites.length === 0}>
						Favorites ({favorites.length})
					</Button>
				</div>

				{/* LOADING STATE */}
				{loading && (
					<div className="text-center py-8">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 "></div>
						<p className="mt-2 text-gray-600">Loading recipes...</p>
					</div>
				)}

				{/* RECIPE GRID */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"></div>
			</div>
		</div>
	);
};

export default App;
