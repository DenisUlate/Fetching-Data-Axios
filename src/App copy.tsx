import React, { useState, useEffect } from "react";
import { Search, Clock, Users, Heart, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API_KEY = "42a448fa3cce4f979d8def392dd8017f"; // Replace with your actual API key
const API_BASE_URL = "api.spoonacular.com/recipes/random"; // Replace with your actual API URL

const App = () => {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [favorites, setFavorites] = useState([]);
	const [selectedRecipe, setSelectedRecipe] = useState(null);
	const [error, setError] = useState("");

	// Fetch random recipes on component mount
	useEffect(() => {
		fetchRandomRecipes();
	}, []);

	// Function to fetch random recipes
	const fetchRandomRecipes = async () => {
		console.log("fetchRandomRecipes called"); // BORRAR
		setLoading(true);
		setError("");
		try {
			const response = await axios.get(`${API_BASE_URL}/random`, {
				params: {
					apiKey: API_KEY,
					number: 6,
				},
			});

			setRecipes(response.data.recipes || []);
		} catch (error) {
			console.error("Error fetching random recipes:", error);
			setError("Error al cargar las recetas. Verifica tu API key.");
		} finally {
			setLoading(false);
		}
	};

	// Function to search recipes
	const searchRecipes = async () => {
		if (!searchTerm.trim()) return;

		setLoading(true);
		setError("");
		try {
			const response = await axios.get(`${API_BASE_URL}/complexSearch`, {
				params: {
					apiKey: API_KEY,
					query: searchTerm,
					number: 12,
					addRecipeInformation: true,
				},
			});
			setRecipes(response.data.results || []);
		} catch (error) {
			console.error("Error searching recipes:", error);
			setError("Error en la búsqueda. Intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	// Function to handle favorite toggle
	const getRecipeDetails = async (id) => {
		setError("");
		try {
			const response = await axios.get(`${API_BASE_URL}/${id}/information`, {
				params: {
					apiKey: API_KEY,
				},
			});
			setSelectedRecipe(response.data);
		} catch (error) {
			console.error("Error fetching recipe details:", error);
			setError("Error al cargar los detalles de la receta.");
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

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			searchRecipes();
		}
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
							onKeyPress={handleKeyPress}
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{recipes.map((recipe) => (
						<Card key={recipe.id} className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardHeader className="p-0">
								<div className="relative">
									<img
										src={recipe.image || "/api/placeholder/400/320"}
										alt={recipe.title}
										className="w-full h-48 object-cover rounded-t-lg"
										onError={(e) => {
											e.target.src = "/api/placeholder/400/320";
										}}
									/>
									<Button
										size="sm"
										variant={isFavorite(recipe.id) ? "default" : "outline"}
										className="absolute top-2 right-2"
										onClick={(e) => {
											e.stopPropagation();
											toggleFavorite(recipe);
										}}>
										<Heart className={`w-4 h-4 ${isFavorite(recipe.id) ? "fill-current" : ""}`} />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="p-4">
								<CardTitle className="text-lg mb-2 line-clamp-2">{recipe.title}</CardTitle>
								<div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
									{recipe.readyInMinutes && (
										<div className="flex items-center gap-1">
											<Clock className="w-4 h-4" />
											{recipe.readyInMinutes}m
										</div>
									)}
									{recipe.servings && (
										<div className="flex items-center gap-1">
											<Users className="w-4 h-4" />
											{recipe.servings} servings
										</div>
									)}
								</div>
								<div className="flex flex-wrap gap-1 mb-3">
									{recipe.dishTypes?.slice(0, 2).map((type, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{type}
										</Badge>
									))}
								</div>
								<Button className="w-full" onClick={() => getRecipeDetails(recipe.id)} variant="outline">
									View Recipe
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* RECIPE DETAILS MODAL */}
				{selectedRecipe && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<CardHeader>
								<div className="flex justify-between items-start">
									<CardTitle className="text-2xl">{selectedRecipe.title}</CardTitle>
									<Button variant="outline" size="sm" onClick={() => setSelectedRecipe(null)}>
										✕
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<img
									src={selectedRecipe.image || "/api/placeholder/600/400"}
									alt={selectedRecipe.title}
									className="w-full h-64 object-cover rounded-lg mb-4"
								/>
								<div className="grid grid-cols-3 gap-4 mb-4">
									<div className="text-center">
										<Clock className="w-6 h-6 mx-auto mb-1" />
										<p className="text-sm font-medium">{selectedRecipe.readyInMinutes || "N/A"} min</p>
									</div>
									<div className="text-center">
										<Users className="w-6 h-6 mx-auto mb-1" />
										<p className="text-sm font-medium">{selectedRecipe.servings || "N/A"} servings</p>
									</div>
									<div className="text-center">
										<Heart className="w-6 h-6 mx-auto mb-1" />
										<p className="text-sm font-medium">{selectedRecipe.aggregateLikes || 0} likes</p>
									</div>
								</div>
								{selectedRecipe.summary && (
									<div
										className="prose prose-sm max-w-none mb-4"
										dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }}
									/>
								)}
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
