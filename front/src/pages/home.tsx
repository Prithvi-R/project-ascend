import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Dumbbell,
  Apple,
  Target,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Crown,
  Heart,
  Brain,
  Activity,
  Calendar,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-8 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium rounded-full">
              <Crown className="w-4 h-4 mr-2" />
              Level Up Your Life
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              Project Ascend
              <br />
              <span className="text-purple-600">Fitness RPG</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Transform your fitness and nutrition journey into an epic RPG adventure. 
              Level up your real-world skills, complete quests, and become the hero of your own story.
            </p>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
                <Dumbbell className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  Workouts
                </div>
                <div className="text-sm text-slate-600">Track & Level Up</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
                <Apple className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  Nutrition
                </div>
                <div className="text-sm text-slate-600">Fuel Your Journey</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  Quests
                </div>
                <div className="text-sm text-slate-600">Epic Challenges</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200">
                <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  Achievements
                </div>
                <div className="text-sm text-slate-600">Unlock Rewards</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 py-4 text-lg font-medium rounded-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                <Link to="/exercises" className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Explore Exercises
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-slate-700 border-slate-200 px-4 py-2 text-sm font-medium rounded-full">
              <Zap className="w-4 h-4 mr-2" />
              RPG Features
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose Project Ascend?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Turn your fitness goals into an engaging game where every workout, meal, and achievement brings you closer to becoming your best self.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl hover:border-purple-300 transition-colors">
              <Crown className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                RPG Progression System
              </h3>
              <p className="text-slate-600 mb-4">Level up your character with 5 core attributes: Strength, Agility, Endurance, Intelligence, and Charisma.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Gain XP from real activities</span>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
              <Target className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Epic Quest System
              </h3>
              <p className="text-slate-600 mb-4">Complete daily and weekly quests across fitness, nutrition, learning, and social categories.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Custom quest creation</span>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl hover:border-green-300 transition-colors">
              <Dumbbell className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Comprehensive Exercise Library
              </h3>
              <p className="text-slate-600 mb-4">Interactive muscle mapper, detailed instructions, and workout tracking with RPG-style progression.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Visual muscle targeting</span>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl hover:border-orange-300 transition-colors">
              <Apple className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nutrition Mastery
              </h3>
              <p className="text-slate-600 mb-4">Track macros, plan meals, and analyze nutrition trends with gamified progress tracking.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Meal planning & analytics</span>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl hover:border-yellow-300 transition-colors">
              <Trophy className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Achievement System
              </h3>
              <p className="text-slate-600 mb-4">Unlock achievements, earn badges, and celebrate milestones in your fitness journey.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Progress celebration</span>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
              <TrendingUp className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-slate-600 mb-4">Visualize your progress with charts, trends, and insights to optimize your performance.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Data-driven insights</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* RPG Stats Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Your Character Attributes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Every workout, meal, and quest completion contributes to your character's growth across five core attributes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-900 mb-2">Strength</h3>
              <p className="text-sm text-red-700">Build muscle and power through resistance training</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Agility</h3>
              <p className="text-sm text-green-700">Improve speed, flexibility, and coordination</p>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Endurance</h3>
              <p className="text-sm text-blue-700">Boost cardiovascular health and stamina</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Intelligence</h3>
              <p className="text-sm text-purple-700">Learn nutrition and fitness knowledge</p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-yellow-900 mb-2">Charisma</h3>
              <p className="text-sm text-yellow-700">Share progress and inspire others</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Begin Your Epic Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of heroes who have transformed their lives through the power of gamified fitness. Your adventure awaits!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Start Your Adventure
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300">
              <Link to="/exercises" className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Explore Features
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="text-center py-4">
        <Link to="404" className="underline text-foreground/40">
          404 Page
        </Link>
      </section>
    </div>
  );
}